(function (global) {
  "use strict";

  const STORAGE_PROGRESS_KEY = "love_quiz_progress_v1";
  const STORAGE_LATEST_KEY = "love_quiz_latest_solo_v1";

  /* ==================== 纯计算与编解码引擎（可脱离 DOM 独立测试） ==================== */

  function computeDimensionBounds(config) {
    const stats = {};
    config.dimensions.forEach((dim) => {
      let meanSum = 0;
      let varSum = 0;
      let minSum = 0;
      let maxSum = 0;
      config.questions.forEach((q) => {
        const vals = q.options.map((opt) => (opt.weights && opt.weights[dim.key]) || 0);
        const mu = vals.reduce((acc, v) => acc + v, 0) / vals.length;
        const vr = vals.reduce((acc, v) => acc + (v - mu) * (v - mu), 0) / vals.length;
        meanSum += mu;
        varSum += vr;
        minSum += Math.min.apply(null, vals);
        maxSum += Math.max.apply(null, vals);
      });
      stats[dim.key] = {
        min: minSum,
        max: maxSum,
        mean: meanSum,
        std: Math.sqrt(varSum) || 1
      };
    });
    return stats;
  }

  function scoreAnswers(answers, config) {
    const stats = computeDimensionBounds(config);
    const raw = {};
    config.dimensions.forEach((dim) => {
      raw[dim.key] = 0;
    });

    config.questions.forEach((q, idx) => {
      const pickedKey = answers[idx];
      const option = q.options.find((opt) => opt.key === pickedKey) || q.options[0];
      if (!option || !option.weights) return;
      Object.keys(option.weights).forEach((dimKey) => {
        if (Object.prototype.hasOwnProperty.call(raw, dimKey)) {
          raw[dimKey] += option.weights[dimKey];
        }
      });
    });

    const scores = {};
    config.dimensions.forEach((dim) => {
      const { mean, std } = stats[dim.key];
      const z = (raw[dim.key] - mean) / std;
      const pct = 50 + z * 18;
      scores[dim.key] = Math.max(8, Math.min(96, Math.round(pct)));
    });

    return { raw, scores };
  }

  function matchArchetype(scores, config) {
    const ranked = config.archetypes
      .map((arch) => {
        let sumSq = 0;
        config.dimensions.forEach((dim) => {
          const diff = (scores[dim.key] || 0) - (arch.target[dim.key] || 50);
          sumSq += diff * diff;
        });
        const dist = Math.sqrt(sumSq / config.dimensions.length);
        return { archetype: arch, distance: dist };
      })
      .sort((a, b) => a.distance - b.distance);

    return {
      primary: ranked[0].archetype,
      secondary: ranked[1].archetype,
      ranked
    };
  }

  function buildDynamicReasons(scores, archetype, config) {
    const dimList = config.dimensions
      .map((dim) => ({
        ...dim,
        score: scores[dim.key]
      }))
      .sort((a, b) => b.score - a.score);

    const top1 = dimList[0];
    const top2 = dimList[1];
    const lowest = dimList[dimList.length - 1];

    const reasons = [
      `你的「${top1.label}」高达 ${top1.score} 分，是最鲜明的恋爱底色——${top1.highDesc}。`,
      `其次突出的「${top2.label}」（${top2.score} 分）进一步塑造了你在「${archetype.name}」中的独特气质：${top2.highDesc}。`
    ];

    if (lowest.score <= 45) {
      reasons.push(
        `同时你的「${lowest.label}」偏克制（${lowest.score} 分），说明${lowest.lowDesc}，这让你与「${archetype.name}」高度贴合。`
      );
    } else {
      reasons.push(
        `你的六个恋爱维度整体相对均衡（最低项「${lowest.label}」也有 ${lowest.score} 分），在感情里具备较好的调节弹性。`
      );
    }

    return reasons;
  }

  function buildSingleResult(answers, nickname, config) {
    const { scores } = scoreAnswers(answers, config);
    const matched = matchArchetype(scores, config);
    const cleanName = (nickname || "").trim() || "匿名恋爱观察员";
    const result = {
      nickname: cleanName,
      archetypeId: matched.primary.id,
      secondaryId: matched.secondary.id,
      scores,
      reasons: buildDynamicReasons(scores, matched.primary, config),
      createdAt: Date.now()
    };
    result.passcode = encodePasscode(result, config);
    return result;
  }

  function toBase64Url(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function fromBase64Url(b64) {
    const norm = b64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = norm + "===".slice((norm.length + 3) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }

  function checksumTag(payloadStr) {
    let hash = 2166136261;
    for (let i = 0; i < payloadStr.length; i += 1) {
      hash ^= payloadStr.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return ((hash >>> 0) % 1296).toString(36).padStart(2, "0");
  }

  function encodePasscode(result, config) {
    const prefix = (config.meta && config.meta.passcodePrefix) || "LOVE";
    const vec = config.dimensions.map((d) => Math.max(0, Math.min(100, Math.round(result.scores[d.key] || 0))));
    const compact = {
      v: 1,
      n: (result.nickname || "TA").slice(0, 12),
      a: result.archetypeId,
      d: vec
    };
    const json = JSON.stringify(compact);
    const body = toBase64Url(json);
    const sig = checksumTag(body);
    return `${prefix}-${body}.${sig}`;
  }

  function extractTokenFromInput(rawInput, config) {
    if (!rawInput || typeof rawInput !== "string") return "";
    const trimmed = rawInput.trim();
    const prefix = (config.meta && config.meta.passcodePrefix) || "LOVE";

    // 如果是完整链接，先尝试读取 ?partner= 参数
    if (/^https?:\/\//i.test(trimmed) || /^file:\/\//i.test(trimmed) || trimmed.includes("partner=")) {
      const match = trimmed.match(/[?&#]partner=([^&#\s]+)/i);
      if (match && match[1]) {
        try {
          return decodeURIComponent(match[1]);
        } catch (e) {
          return match[1];
        }
      }
    }

    // 提取文本中夹带的口令（兼容微信转发时前后带字）
    const codeRegex = new RegExp(`${prefix}-[A-Za-z0-9_-]+\\.[A-Za-z0-9]{2}`);
    const inlineMatch = trimmed.match(codeRegex);
    return inlineMatch ? inlineMatch[0] : trimmed;
  }

  function decodePasscode(rawInput, config) {
    const token = extractTokenFromInput(rawInput, config);
    const prefix = (config.meta && config.meta.passcodePrefix) || "LOVE";
    if (!token || !token.startsWith(`${prefix}-`) || !token.includes(".")) {
      return null;
    }

    const bodyAndSig = token.slice(prefix.length + 1);
    const dotIndex = bodyAndSig.lastIndexOf(".");
    if (dotIndex <= 0) return null;

    const body = bodyAndSig.slice(0, dotIndex);
    const sig = bodyAndSig.slice(dotIndex + 1);
    if (checksumTag(body) !== sig) {
      return null;
    }

    try {
      const parsed = JSON.parse(fromBase64Url(body));
      if (!parsed || !Array.isArray(parsed.d) || parsed.d.length !== config.dimensions.length) {
        return null;
      }
      const arch = config.archetypes.find((item) => item.id === parsed.a);
      if (!arch) return null;

      const scores = {};
      config.dimensions.forEach((dim, i) => {
        scores[dim.key] = Math.max(0, Math.min(100, Number(parsed.d[i]) || 0));
      });

      return {
        nickname: (parsed.n || "对方").slice(0, 12),
        archetypeId: arch.id,
        scores,
        passcode: token
      };
    } catch (e) {
      return null;
    }
  }

  function getArchetypeById(id, config) {
    return config.archetypes.find((a) => a.id === id) || config.archetypes[0];
  }

  function computeCoupleCompatibility(personA, personB, config) {
    const archA = getArchetypeById(personA.archetypeId, config);
    const archB = getArchetypeById(personB.archetypeId, config);

    // 1. 维度协同计算
    let closenessWeighted = 0;
    let totalWeight = 0;
    const dimDiffs = [];

    config.dimensions.forEach((dim) => {
      const a = personA.scores[dim.key] || 0;
      const b = personB.scores[dim.key] || 0;
      const diff = Math.abs(a - b);
      const avg = (a + b) / 2;

      // 投入度、共情、玩心越接近越顺畅；依恋和稳态允许适度互补
      let weight = 1.0;
      let dimMatch = 100 - diff;

      if (dim.key === "rational") {
        // 如果一方稳态较高(>=65)而另一方感性(<50)，适度互补反而稳住情绪
        if (Math.max(a, b) >= 65 && Math.min(a, b) <= 50 && diff <= 45) {
          dimMatch = Math.max(dimMatch, 78);
        }
        weight = 1.1;
      } else if (dim.key === "devotion" || dim.key === "empathy") {
        weight = 1.2;
        if (avg >= 70 && diff <= 22) {
          dimMatch = Math.min(100, dimMatch + 6);
        }
      } else if (dim.key === "intimacy") {
        weight = 1.15;
      }

      closenessWeighted += dimMatch * weight;
      totalWeight += weight;

      dimDiffs.push({
        key: dim.key,
        label: dim.label,
        a,
        b,
        diff,
        avg,
        higher: a >= b ? "A" : "B"
      });
    });

    let baseScore = closenessWeighted / totalWeight;

    // 2. 原型协同加成
    const aLikesB = archA.bestMatches.some((m) => m.id === archB.id);
    const bLikesA = archB.bestMatches.some((m) => m.id === archA.id);
    let synergyBonus = 0;
    if (aLikesB && bLikesA) {
      synergyBonus = 9;
    } else if (aLikesB || bLikesA) {
      synergyBonus = 6;
    } else if (archA.id === archB.id) {
      synergyBonus = 4;
    } else if (archA.growthMatch.id === archB.id || archB.growthMatch.id === archA.id) {
      synergyBonus = 1;
    }

    // 互补加分：双方高分项能覆盖彼此短板
    const devotionFloor = Math.min(personA.scores.devotion, personB.scores.devotion);
    const empathyCeiling = Math.max(personA.scores.empathy, personB.scores.empathy);
    if (devotionFloor >= 65 && empathyCeiling >= 70) {
      synergyBonus += 4;
    }

    const finalScore = Math.max(58, Math.min(98, Math.round(baseScore * 0.88 + 10 + synergyBonus)));

    let tier = {
      code: "CP-GOLD",
      label: "天作之合",
      quote: "“你们的喜欢刚好落在同一条频率上，连沉默都带着安全感。”"
    };
    if (finalScore >= 90) {
      tier = {
        code: "CP-SOUL",
        label: "灵魂天选",
        quote: "“不用刻意迎合彼此的步调，因为你们天生就朝着同一个方向发光。”"
      };
    } else if (finalScore >= 82) {
      tier = {
        code: "CP-GOLD",
        label: "天作之合",
        quote: "“一个眼神就接得住对方的梗，连吵架都像在撒娇确认偏爱。”"
      };
    } else if (finalScore >= 73) {
      tier = {
        code: "CP-SPARK",
        label: "互补升温",
        quote: "“你们带着不同的性格底色相遇，越磨合越能照亮彼此没去过的风景。”"
      };
    } else {
      tier = {
        code: "CP-GROW",
        label: "跨频奇遇",
        quote: "“差异感让你们最初互相吸引，多一分翻译彼此的耐心就能走得很远。”"
      };
    }

    const headline =
      archA.id === archB.id
        ? `双倍「${archA.name.slice(0, 4)}」· 镜像同频`
        : `${archA.name} × ${archB.name}`;

    // 天生合拍点
    const sortedByHarmony = [...dimDiffs].sort((x, y) => x.diff - y.diff);
    const harmonyPoints = [];
    sortedByHarmony.slice(0, 2).forEach((d) => {
      if (d.avg >= 62) {
        harmonyPoints.push(
          `在「${d.label}」上高度同步（${personA.nickname} ${d.a}分 / ${personB.nickname} ${d.b}分）：双方都很看重这一块，很少会因为节奏错位而消耗感情。`
        );
      } else {
        harmonyPoints.push(
          `在「${d.label}」上尺度一致（${d.a}分 vs ${d.b}分）：你们对这件事的期待差不多，天然省去了一大笔磨合沟通成本。`
        );
      }
    });
    if (aLikesB || bLikesA) {
      harmonyPoints.push(
        `原型天然互吸：「${archA.name}」与「${archB.name}」属于高契合配对，一方最在乎的偏爱形式刚好是另一方的拿手强项。`
      );
    }

    // 魅力互补区
    const sortedByDiff = [...dimDiffs].sort((x, y) => y.diff - x.diff);
    const complementPoints = [];
    const topGap = sortedByDiff[0];
    const secondGap = sortedByDiff[1];

    const nameHigh1 = topGap.higher === "A" ? personA.nickname : personB.nickname;
    const nameLow1 = topGap.higher === "A" ? personB.nickname : personA.nickname;
    complementPoints.push(
      `「${topGap.label}」形成魅力反差：${nameHigh1}（${Math.max(topGap.a, topGap.b)}分）可以主动带着 ${nameLow1}（${Math.min(topGap.a, topGap.b)}分）体验不同的恋爱视角，避免日子陷入单调。`
    );

    const rationalGap = dimDiffs.find((d) => d.key === "rational");
    if (rationalGap && rationalGap.diff >= 15) {
      const calmName = rationalGap.higher === "A" ? personA.nickname : personB.nickname;
      const softName = rationalGap.higher === "A" ? personB.nickname : personA.nickname;
      complementPoints.push(
        `情绪定力互补：当 ${softName} 情绪翻涌时，${calmName} 的冷静稳态就是最好的压舱石；而 ${softName} 的敏感热烈也会让 ${calmName} 感到鲜活被需要。`
      );
    } else {
      const nameHigh2 = secondGap.higher === "A" ? personA.nickname : personB.nickname;
      complementPoints.push(
        `「${secondGap.label}」分工天然默契：由更擅长的 ${nameHigh2} 来主导这类约会或沟通场景，双方都会觉得省心又甜。`
      );
    }

    // 摩擦预警与保鲜处方
    const frictionPoints = [];
    const intimacyGap = dimDiffs.find((d) => d.key === "intimacy");
    const romanceGap = dimDiffs.find((d) => d.key === "romance");

    if (intimacyGap && intimacyGap.diff >= 24) {
      const clingName = intimacyGap.higher === "A" ? personA.nickname : personB.nickname;
      const spaceName = intimacyGap.higher === "A" ? personB.nickname : personA.nickname;
      frictionPoints.push(
        `注意“亲密与独处”时差：${clingName} 依恋浓度较高（${Math.max(intimacyGap.a, intimacyGap.b)}分），${spaceName} 更需要留白（${Math.min(intimacyGap.a, intimacyGap.b)}分）。建议约定“我要专心忙两小时，忙完立刻找你”，能减少 80% 猜疑。`
      );
    }
    if (romanceGap && romanceGap.diff >= 24) {
      const romName = romanceGap.higher === "A" ? personA.nickname : personB.nickname;
      const pragName = romanceGap.higher === "A" ? personB.nickname : personA.nickname;
      frictionPoints.push(
        `爱的语言频道不同：${romName} 吃仪式感与嘴甜夸奖，${pragName} 习惯闷头做事。${romName} 想被夸时直接撒娇点菜，${pragName} 把心里那句“今天很好看”顺嘴说出来就够甜了。`
      );
    }
    if (frictionPoints.length === 0) {
      frictionPoints.push(
        `你们各项维度差距都不极端，最需要防范的反而是“太合拍导致的安逸感”——记得每隔一段时间制造一点跳出日常的小冒险（哪怕是去陌生的城市住一晚）。`
      );
    }
    if (archA.growthMatch.id === archB.id) {
      frictionPoints.push(`专属磨合提示：${archA.growthMatch.reason}`);
    } else if (archB.growthMatch.id === archA.id) {
      frictionPoints.push(`专属磨合提示：${archB.growthMatch.reason}`);
    }

    // 双人趣味彩蛋
    const coaxScoreA = personA.scores.devotion * 0.5 + personA.scores.rational * 0.3 + personA.scores.playful * 0.2;
    const coaxScoreB = personB.scores.devotion * 0.5 + personB.scores.rational * 0.3 + personB.scores.playful * 0.2;
    const firstCoaxName =
      Math.abs(coaxScoreA - coaxScoreB) < 4
        ? "几乎同时破冰（谁先看到对方委屈谁就心软）"
        : coaxScoreA > coaxScoreB
          ? `${personA.nickname} 更容易先递台阶哄人`
          : `${personB.nickname} 更容易先递台阶哄人`;

    const avgPlay = (personA.scores.playful + personB.scores.playful) / 2;
    const avgRom = (personA.scores.romance + personB.scores.romance) / 2;
    let weekendScript = "窝在家一起做顿简单晚饭，晚上散步顺路买支冰淇淋";
    if (avgPlay >= 70 && avgRom >= 65) {
      weekendScript = "白天去没逛过的街区探店拍照，晚上看落日配微醺小酒";
    } else if (avgPlay >= 70) {
      weekendScript = "来一场说走就走的周边兜风/夜市扫街，边走边互相接梗大笑";
    } else if (avgRom >= 70) {
      weekendScript = "花半天逛花市与家居店，回家点香薰重温一部彼此喜欢的电影";
    }

    const secretCode = `“${archA.code} × ${archB.code} · 今天也在偏向你”`;

    return {
      score: finalScore,
      tier,
      headline,
      personA: { ...personA, archetype: archA },
      personB: { ...personB, archetype: archB },
      dimDiffs,
      harmonyPoints,
      complementPoints,
      frictionPoints,
      easterEggs: {
        firstCoax: firstCoaxName,
        weekendScript,
        secretCode,
        chemistryTag: `${archA.tags[0]} × ${archB.tags[0]}`
      }
    };
  }

  function buildPresetResult(archetypeId, nickname, config) {
    const arch = getArchetypeById(archetypeId, config);
    const scores = {};
    config.dimensions.forEach((dim) => {
      scores[dim.key] = Math.max(0, Math.min(100, Math.round(arch.target[dim.key] || 50)));
    });
    const cleanName = (nickname || "").trim() || arch.name;
    const result = {
      nickname: cleanName,
      archetypeId: arch.id,
      secondaryId: arch.bestMatches && arch.bestMatches[0] ? arch.bestMatches[0].id : arch.id,
      scores,
      reasons: buildDynamicReasons(scores, arch, config),
      createdAt: Date.now()
    };
    result.passcode = encodePasscode(result, config);
    return result;
  }

  // 暴露引擎供测试脚本校验
  global.LoveQuizEngine = {
    computeDimensionBounds,
    scoreAnswers,
    matchArchetype,
    buildSingleResult,
    buildPresetResult,
    encodePasscode,
    decodePasscode,
    computeCoupleCompatibility
  };

  if (typeof document === "undefined") {
    return;
  }

  /* ==================== 浏览器交互与渲染逻辑 ==================== */

  const CONFIG = global.QUIZ_CONFIG;
  if (!CONFIG) return;

  const state = {
    mode: "solo", // "solo" | "direct" | "compare"
    nicknameA: "",
    answers: [],
    currentIndex: 0,
    invitedPartner: null,
    directArchetypeA: CONFIG.archetypes[0].id,
    directArchetypeB: CONFIG.archetypes[1].id,
    currentSoloResult: null,
    currentCoupleResult: null,
    screenshotMode: false
  };

  const STORAGE_UNLOCKED_KEY = "love_quiz_unlocked_v1";

  const FALLBACK_ICON_SPEC = {
    paths: ["M12 4 19 12 12 20 5 12 Z"]
  };

  function getIconSpec(id) {
    return (CONFIG.icons && CONFIG.icons[id]) || FALLBACK_ICON_SPEC;
  }

  function getArchetypeIconSvg(id) {
    const spec = getIconSpec(id);
    const paths = (spec.paths || []).map((d) => `<path d="${d}" />`).join("");
    const ellipses = (spec.ellipses || [])
      .map((el) => {
        const tf = el.rotate ? ` transform="rotate(${el.rotate} ${el.cx} ${el.cy})"` : "";
        return `<ellipse cx="${el.cx}" cy="${el.cy}" rx="${el.rx}" ry="${el.ry}"${tf} />`;
      })
      .join("");
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths}${ellipses}</svg>`;
  }

  function drawCanvasArchetypeIcon(ctx, cx, cy, id, color) {
    const spec = getIconSpec(id);
    const scale = 2.05; // 24x24 -> ~49px inside 92px seal
    ctx.save();
    ctx.translate(cx - 12 * scale, cy - 12 * scale);
    ctx.scale(scale, scale);
    ctx.strokeStyle = color || "#9e424d";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (typeof Path2D !== "undefined") {
      (spec.paths || []).forEach((d) => {
        ctx.stroke(new Path2D(d));
      });
    }

    (spec.ellipses || []).forEach((el) => {
      ctx.beginPath();
      const rot = ((el.rotate || 0) * Math.PI) / 180;
      ctx.ellipse(el.cx, el.cy, el.rx, el.ry, rot, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.restore();
  }

  const MODE_CAPTIONS = {
    solo: "完整作答 40 道生活切片，生成个人六维档案，并可生成合拍口令或直接选 TA 的原型比对。",
    direct: "免去双方重复答题：直接选定彼此的恋爱人格原型，即刻生成双人叠层雷达图与对照档案。",
    compare: "双方均已完成过 40 题探索？粘贴彼此生成的 LOVE- 合拍口令，按精确六维分值测算适配度。"
  };

  const els = {
    brandHomeBtn: document.getElementById("brandHomeBtn"),
    brandTitle: document.getElementById("brandTitle"),
    openAtlasBtn: document.getElementById("openAtlasBtn"),
    screenshotModeBtn: document.getElementById("screenshotModeBtn"),
    topbarResetBtn: document.getElementById("topbarResetBtn"),
    heroBadge: document.getElementById("heroBadge"),
    heroTitle: document.getElementById("heroTitle"),
    heroSubtitle: document.getElementById("heroSubtitle"),
    disclaimerText: document.getElementById("disclaimerText"),

    views: {
      home: document.getElementById("view-home"),
      quiz: document.getElementById("view-quiz"),
      result: document.getElementById("view-result"),
      couple: document.getElementById("view-couple-result")
    },

    inviteBanner: document.getElementById("inviteBanner"),
    inviteBannerTitle: document.getElementById("inviteBannerTitle"),
    inviteBannerDesc: document.getElementById("inviteBannerDesc"),
    clearInviteBtn: document.getElementById("clearInviteBtn"),

    modeGrid: document.getElementById("modeGrid"),
    modeCaption: document.getElementById("modeCaption"),
    startPanel: document.getElementById("startPanel"),
    directComparePanel: document.getElementById("directComparePanel"),
    directNameA: document.getElementById("directNameA"),
    directNameB: document.getElementById("directNameB"),
    directGridA: document.getElementById("directGridA"),
    directGridB: document.getElementById("directGridB"),
    directLivePairText: document.getElementById("directLivePairText"),
    runDirectCompareBtn: document.getElementById("runDirectCompareBtn"),
    comparePanel: document.getElementById("comparePanel"),
    nicknameLabel: document.getElementById("nicknameLabel"),
    nicknameInput: document.getElementById("nicknameInput"),
    startQuizBtn: document.getElementById("startQuizBtn"),
    startQuizBtnText: document.getElementById("startQuizBtnText"),
    resumeQuizBtn: document.getElementById("resumeQuizBtn"),
    resumeIndexText: document.getElementById("resumeIndexText"),

    passcodeAInput: document.getElementById("passcodeAInput"),
    passcodeBInput: document.getElementById("passcodeBInput"),
    fillMyLatestBtn: document.getElementById("fillMyLatestBtn"),
    compareErrorHint: document.getElementById("compareErrorHint"),
    runCompareBtn: document.getElementById("runCompareBtn"),

    chapterPill: document.getElementById("chapterPill"),
    quizPlayerPill: document.getElementById("quizPlayerPill"),
    progressCount: document.getElementById("progressCount"),
    progressFill: document.getElementById("progressFill"),
    chapterDots: document.getElementById("chapterDots"),
    questionStage: document.getElementById("questionStage"),
    chapterMilestone: document.getElementById("chapterMilestone"),
    questionKicker: document.getElementById("questionKicker"),
    questionText: document.getElementById("questionText"),
    optionsList: document.getElementById("optionsList"),
    prevQuestionBtn: document.getElementById("prevQuestionBtn"),
    restartDuringQuizBtn: document.getElementById("restartDuringQuizBtn"),

    soloPosterBrand: document.getElementById("soloPosterBrand"),
    soloArchetypeCode: document.getElementById("soloArchetypeCode"),
    soloNicknameBadge: document.getElementById("soloNicknameBadge"),
    soloEmblem: document.getElementById("soloEmblem"),
    soloArchetypeName: document.getElementById("soloArchetypeName"),
    soloArchetypeEn: document.getElementById("soloArchetypeEn"),
    soloQuote: document.getElementById("soloQuote"),
    soloTags: document.getElementById("soloTags"),
    soloRadarSvg: document.getElementById("soloRadarSvg"),
    soloDimensionBars: document.getElementById("soloDimensionBars"),
    soloMiniSummary: document.getElementById("soloMiniSummary"),
    soloTraitsText: document.getElementById("soloTraitsText"),
    soloPaywallCard: document.getElementById("soloPaywallCard"),
    soloPaywallTitle: document.getElementById("soloPaywallTitle"),
    soloPaywallDesc: document.getElementById("soloPaywallDesc"),
    soloUnlockInput: document.getElementById("soloUnlockInput"),
    soloUnlockBtn: document.getElementById("soloUnlockBtn"),
    soloUnlockHint: document.getElementById("soloUnlockHint"),
    soloDeepGroup: document.getElementById("soloDeepGroup"),
    soloReasonsList: document.getElementById("soloReasonsList"),
    soloStrengthText: document.getElementById("soloStrengthText"),
    soloBlindspotText: document.getElementById("soloBlindspotText"),
    soloMatchGrid: document.getElementById("soloMatchGrid"),
    soloEasterGrid: document.getElementById("soloEasterGrid"),

    soloPasscodeDisplay: document.getElementById("soloPasscodeDisplay"),
    copyPasscodeBtn: document.getElementById("copyPasscodeBtn"),
    copyInviteLinkBtn: document.getElementById("copyInviteLinkBtn"),
    pickPartnerArchBtn: document.getElementById("pickPartnerArchBtn"),
    inlineArchDrawer: document.getElementById("inlineArchDrawer"),
    inlinePartnerNameInput: document.getElementById("inlinePartnerNameInput"),
    inlinePartnerArchGrid: document.getElementById("inlinePartnerArchGrid"),
    enterPartnerCodeBtn: document.getElementById("enterPartnerCodeBtn"),
    inlinePartnerBox: document.getElementById("inlinePartnerBox"),
    inlinePartnerInput: document.getElementById("inlinePartnerInput"),
    inlineCompareGoBtn: document.getElementById("inlineCompareGoBtn"),
    soloToast: document.getElementById("soloToast"),
    downloadSoloPosterBtn: document.getElementById("downloadSoloPosterBtn"),
    toggleSoloScreenshotBtn: document.getElementById("toggleSoloScreenshotBtn"),
    retakeSoloBtn: document.getElementById("retakeSoloBtn"),

    coupleTierCode: document.getElementById("coupleTierCode"),
    coupleNameA: document.getElementById("coupleNameA"),
    coupleArchA: document.getElementById("coupleArchA"),
    coupleNameB: document.getElementById("coupleNameB"),
    coupleArchB: document.getElementById("coupleArchB"),
    coupleScoreRing: document.getElementById("coupleScoreRing"),
    coupleScoreNum: document.getElementById("coupleScoreNum"),
    coupleScoreLabel: document.getElementById("coupleScoreLabel"),
    coupleHeadline: document.getElementById("coupleHeadline"),
    coupleQuote: document.getElementById("coupleQuote"),
    legendNameA: document.getElementById("legendNameA"),
    legendNameB: document.getElementById("legendNameB"),
    coupleRadarSvg: document.getElementById("coupleRadarSvg"),
    coupleDimensionCompare: document.getElementById("coupleDimensionCompare"),
    coupleHarmonyList: document.getElementById("coupleHarmonyList"),
    couplePaywallCard: document.getElementById("couplePaywallCard"),
    couplePaywallTitle: document.getElementById("couplePaywallTitle"),
    couplePaywallDesc: document.getElementById("couplePaywallDesc"),
    coupleUnlockInput: document.getElementById("coupleUnlockInput"),
    coupleUnlockBtn: document.getElementById("coupleUnlockBtn"),
    coupleUnlockHint: document.getElementById("coupleUnlockHint"),
    coupleDeepGroup: document.getElementById("coupleDeepGroup"),
    coupleComplementList: document.getElementById("coupleComplementList"),
    coupleFrictionList: document.getElementById("coupleFrictionList"),
    coupleEasterGrid: document.getElementById("coupleEasterGrid"),
    downloadCouplePosterBtn: document.getElementById("downloadCouplePosterBtn"),
    toggleCoupleScreenshotBtn: document.getElementById("toggleCoupleScreenshotBtn"),
    backToSoloBtn: document.getElementById("backToSoloBtn"),
    retakeCoupleBtn: document.getElementById("retakeCoupleBtn"),

    archetypeAtlasModal: document.getElementById("archetypeAtlasModal"),
    closeAtlasBtn: document.getElementById("closeAtlasBtn"),
    atlasGrid: document.getElementById("atlasGrid"),
    posterPreviewModal: document.getElementById("posterPreviewModal"),
    closePosterModalBtn: document.getElementById("closePosterModalBtn"),
    posterPreviewImg: document.getElementById("posterPreviewImg"),
    confirmDownloadPosterBtn: document.getElementById("confirmDownloadPosterBtn")
  };

  function safeStorageGet(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // 忽略隐私模式或文件协议限制
    }
  }

  function safeStorageRemove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // ignore
    }
  }

  function switchView(targetName) {
    Object.keys(els.views).forEach((name) => {
      els.views[name].classList.toggle("active", name === targetName);
    });
    const isResult = targetName === "result" || targetName === "couple";
    const isHome = targetName === "home";
    els.screenshotModeBtn.classList.toggle("hidden", !isResult);
    els.topbarResetBtn.classList.toggle("hidden", isHome);

    if (!isResult && state.screenshotMode) {
      setScreenshotMode(false);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setScreenshotMode(enabled) {
    state.screenshotMode = enabled;
    document.body.classList.toggle("screenshot-mode", enabled);
    els.screenshotModeBtn.textContent = enabled ? "退出纯净模式" : "纯净海报模式";
    els.toggleSoloScreenshotBtn.textContent = enabled ? "查看完整报告" : "切换纯净海报视图";
    els.toggleCoupleScreenshotBtn.textContent = enabled ? "查看完整报告" : "切换纯净海报视图";
  }

  function applyThemeFromConfig() {
    if (!CONFIG.theme) return;
    const root = document.documentElement;
    const map = {
      bgPage: "--bg-page",
      bgSurface: "--bg-surface",
      bgSurfaceMuted: "--bg-surface-muted",
      textPrimary: "--text-primary",
      textSecondary: "--text-secondary",
      textMuted: "--text-muted",
      accent: "--accent",
      accentDeep: "--accent-deep",
      gold: "--gold",
      inkBtn: "--ink-btn"
    };
    Object.keys(map).forEach((key) => {
      if (CONFIG.theme[key]) {
        root.style.setProperty(map[key], CONFIG.theme[key]);
      }
    });
  }

  function isPaywallLocked() {
    if (!CONFIG.paywall || !CONFIG.paywall.enabled) return false;
    return !safeStorageGet(STORAGE_UNLOCKED_KEY);
  }

  function applyPaywallState() {
    const locked = isPaywallLocked();
    els.soloPaywallCard.classList.toggle("hidden", !locked);
    els.soloDeepGroup.classList.toggle("hidden", locked);
    els.couplePaywallCard.classList.toggle("hidden", !locked);
    els.coupleDeepGroup.classList.toggle("hidden", locked);

    if (locked && CONFIG.paywall) {
      els.soloPaywallTitle.textContent = CONFIG.paywall.title || "解锁完整档案";
      els.soloPaywallDesc.textContent = CONFIG.paywall.desc || "";
      els.couplePaywallTitle.textContent = CONFIG.paywall.title || "解锁完整双人档案";
      els.couplePaywallDesc.textContent = CONFIG.paywall.desc || "";
    }
  }

  function tryUnlockPaywall(inputEl, hintEl) {
    const raw = (inputEl.value || "").trim().toUpperCase();
    const valid = ((CONFIG.paywall && CONFIG.paywall.validCodes) || []).map((c) => String(c).toUpperCase());
    if (!raw || !valid.includes(raw)) {
      hintEl.textContent = "兑换口令不正确，请核对后重新输入。";
      hintEl.classList.remove("hidden");
      return;
    }
    safeStorageSet(STORAGE_UNLOCKED_KEY, true);
    hintEl.classList.add("hidden");
    applyPaywallState();
  }

  function applyConfigMeta() {
    applyThemeFromConfig();

    if (CONFIG.meta.brandTitle) {
      els.brandTitle.textContent = CONFIG.meta.brandTitle;
      els.soloPosterBrand.textContent = `${CONFIG.meta.brandTitle} · 恋爱人格档案`;
    }
    if (CONFIG.meta.badge) els.heroBadge.textContent = CONFIG.meta.badge;
    if (CONFIG.meta.title) {
      els.heroTitle.innerHTML = CONFIG.meta.title.replace(/\n/g, "<br />");
    }
    if (CONFIG.meta.subtitle) {
      els.heroSubtitle.innerHTML = CONFIG.meta.subtitle.replace(/\n/g, "<br />");
    }
    if (CONFIG.meta.disclaimer) {
      els.disclaimerText.textContent = CONFIG.meta.disclaimer;
    }

    // 章节进度条点
    els.chapterDots.innerHTML = CONFIG.chapters
      .map((ch) => `<span class="chapter-dot" data-chapter="${ch.id}"></span>`)
      .join("");

    renderDirectArchetypeGrids();
    renderInlinePartnerArchGrid();
    renderArchetypeAtlas();
  }

  function updateDirectLivePreview() {
    if (!els.directLivePairText) return;
    const archA = getArchetypeById(state.directArchetypeA, CONFIG);
    const archB = getArchetypeById(state.directArchetypeB, CONFIG);
    const nameA = (els.directNameA.value || "").trim();
    const nameB = (els.directNameB.value || "").trim();
    const leftText = nameA ? `${nameA}（${archA.name}）` : archA.name;
    const rightText = nameB ? `${nameB}（${archB.name}）` : archB.name;
    els.directLivePairText.textContent = `${leftText} × ${rightText}`;
  }

  function renderArchetypeAtlas() {
    if (!els.atlasGrid) return;
    els.atlasGrid.innerHTML = "";
    CONFIG.archetypes.forEach((arch) => {
      const card = document.createElement("article");
      card.className = "atlas-card";
      card.innerHTML = `
        <div class="atlas-card-head">
          <span class="atlas-icon" aria-hidden="true">${getArchetypeIconSvg(arch.id)}</span>
          <div>
            <div class="atlas-name">${arch.name}</div>
            <div class="atlas-sub">${arch.code} · ${arch.en}</div>
          </div>
        </div>
        <p class="atlas-quote">${arch.quote}</p>
        <p class="atlas-desc">${arch.miniSummary}</p>
        <div class="atlas-card-foot">
          <span class="atlas-tags">${arch.tags.join(" · ")}</span>
          <button class="text-btn atlas-use-btn" type="button">加入直配 →</button>
        </div>
      `;
      card.querySelector(".atlas-use-btn").addEventListener("click", () => {
        state.directArchetypeA = arch.id;
        renderDirectArchetypeGrids();
        closeModal(els.archetypeAtlasModal);
        selectMode("direct");
        switchView("home");
      });
      els.atlasGrid.appendChild(card);
    });
  }

  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove("hidden");
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add("hidden");
  }

  function renderDirectArchetypeGrids() {
    const renderCol = (gridEl, selectedId, onPick) => {
      gridEl.innerHTML = "";
      CONFIG.archetypes.forEach((arch) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "arch-pick-btn" + (arch.id === selectedId ? " selected" : "");
        btn.innerHTML = `
          <span class="arch-pick-top"><span class="arch-pick-icon" aria-hidden="true">${getArchetypeIconSvg(arch.id)}</span><span>${arch.name}</span></span>
          <span class="arch-pick-tag">${arch.tags[0]}</span>
        `;
        btn.addEventListener("click", () => onPick(arch.id));
        gridEl.appendChild(btn);
      });
    };

    renderCol(els.directGridA, state.directArchetypeA, (id) => {
      state.directArchetypeA = id;
      renderDirectArchetypeGrids();
    });

    renderCol(els.directGridB, state.directArchetypeB, (id) => {
      state.directArchetypeB = id;
      renderDirectArchetypeGrids();
    });

    updateDirectLivePreview();
  }

  function renderInlinePartnerArchGrid() {
    els.inlinePartnerArchGrid.innerHTML = "";
    CONFIG.archetypes.forEach((arch) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "arch-pick-btn";
      btn.innerHTML = `
        <span class="arch-pick-top"><span class="arch-pick-icon" aria-hidden="true">${getArchetypeIconSvg(arch.id)}</span><span>${arch.name}</span></span>
        <span class="arch-pick-tag">${arch.tags[0]}</span>
      `;
      btn.addEventListener("click", () => {
        if (!state.currentSoloResult) return;
        const partnerResult = buildPresetResult(
          arch.id,
          els.inlinePartnerNameInput.value.trim() || arch.name,
          CONFIG
        );
        showCoupleResult(state.currentSoloResult, partnerResult);
      });
      els.inlinePartnerArchGrid.appendChild(btn);
    });
  }

  function selectMode(mode) {
    state.mode = mode;
    Array.from(els.modeGrid.querySelectorAll(".mode-card")).forEach((card) => {
      const active = card.dataset.mode === mode;
      card.classList.toggle("selected", active);
      card.setAttribute("aria-selected", active ? "true" : "false");
    });

    if (els.modeCaption && MODE_CAPTIONS[mode]) {
      els.modeCaption.textContent = MODE_CAPTIONS[mode];
    }

    els.startPanel.classList.toggle("hidden", mode !== "solo");
    els.directComparePanel.classList.toggle("hidden", mode !== "direct");
    els.comparePanel.classList.toggle("hidden", mode !== "compare");

    if (mode === "solo") {
      els.nicknameLabel.textContent = state.invitedPartner
        ? "你的署名（将与邀请你的 TA 生成双人对照海报）"
        : "署名（选填，将印于个人档案海报）";
      els.startQuizBtnText.textContent = state.invitedPartner
        ? `完成 40 题，对照与「${state.invitedPartner.nickname}」的适配度`
        : "开始 40 题恋爱探索";
    }

    refreshResumeAndLatestHelpers();
  }

  function refreshResumeAndLatestHelpers() {
    const saved = safeStorageGet(STORAGE_PROGRESS_KEY);
    const validSaved =
      saved &&
      Array.isArray(saved.answers) &&
      saved.answers.length > 0 &&
      saved.answers.length < CONFIG.questions.length &&
      !state.invitedPartner;

    els.resumeQuizBtn.classList.toggle("hidden", !validSaved);
    if (validSaved) {
      els.resumeIndexText.textContent = String(saved.answers.length + 1);
    }

    const latest = safeStorageGet(STORAGE_LATEST_KEY);
    els.fillMyLatestBtn.classList.toggle("hidden", !(latest && latest.passcode));
  }

  function checkInviteFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const partnerCode = params.get("partner");
    if (!partnerCode) return;

    const decoded = decodePasscode(partnerCode, CONFIG);
    if (!decoded) return;

    state.invitedPartner = decoded;
    const arch = getArchetypeById(decoded.archetypeId, CONFIG);
    els.inviteBanner.classList.remove("hidden");
    els.inviteBannerTitle.textContent = `收到「${decoded.nickname}」的恋爱合拍邀请`;
    els.inviteBannerDesc.textContent = `TA 的恋爱人格是【${arch.name}】，快测完 40 题揭晓你们的适配度吧！`;
    selectMode("solo");
  }

  function startNewQuiz(resumeSaved) {
    if (resumeSaved) {
      const saved = safeStorageGet(STORAGE_PROGRESS_KEY);
      if (saved && Array.isArray(saved.answers)) {
        state.mode = "solo";
        state.nicknameA = saved.nicknameA || "";
        state.answers = saved.answers.slice();
        state.currentIndex = Math.min(saved.answers.length, CONFIG.questions.length - 1);
        renderQuestion(false);
        switchView("quiz");
        return;
      }
    }

    state.nicknameA = els.nicknameInput.value.trim();
    state.answers = [];
    state.currentIndex = 0;

    saveProgress();
    renderQuestion(false);
    switchView("quiz");
  }

  function saveProgress() {
    safeStorageSet(STORAGE_PROGRESS_KEY, {
      mode: "solo",
      nicknameA: state.nicknameA,
      answers: state.answers
    });
  }

  function renderQuestion(withTransition) {
    const q = CONFIG.questions[state.currentIndex];
    const total = CONFIG.questions.length;
    const chapter = CONFIG.chapters.find((c) => q.id >= c.start && q.id <= c.end) || CONFIG.chapters[0];

    const doUpdate = () => {
      els.chapterPill.textContent = chapter.title;
      els.progressCount.textContent = `${String(state.currentIndex + 1).padStart(2, "0")} / ${total}`;
      const pct = Math.round(((state.currentIndex + 1) / total) * 100);
      els.progressFill.style.width = `${pct}%`;
      els.quizPlayerPill.classList.add("hidden");

      Array.from(els.chapterDots.querySelectorAll(".chapter-dot")).forEach((dot) => {
        const chId = Number(dot.dataset.chapter);
        dot.classList.toggle("done", chId < chapter.id);
        dot.classList.toggle("active", chId === chapter.id);
      });

      if (q.id === chapter.start && chapter.milestone) {
        els.chapterMilestone.textContent = chapter.milestone;
        els.chapterMilestone.classList.remove("hidden");
      } else {
        els.chapterMilestone.classList.add("hidden");
      }

      els.questionKicker.textContent = `SLICE ${String(q.id).padStart(2, "0")}`;
      els.questionText.textContent = q.text;
      els.prevQuestionBtn.disabled = state.currentIndex === 0;

      const selectedKey = state.answers[state.currentIndex];
      els.optionsList.innerHTML = "";
      q.options.forEach((opt) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "option-btn" + (selectedKey === opt.key ? " selected" : "");
        btn.dataset.key = opt.key;
        btn.innerHTML = `
          <span class="option-key">${opt.key}</span>
          <span class="option-text">${opt.text}</span>
        `;
        btn.addEventListener("click", () => handleAnswerSelect(opt.key));
        els.optionsList.appendChild(btn);
      });
    };

    if (!withTransition) {
      doUpdate();
      return;
    }

    els.questionStage.classList.add("switching");
    window.setTimeout(() => {
      doUpdate();
      els.questionStage.classList.remove("switching");
    }, 150);
  }

  let optionLock = false;
  function handleAnswerSelect(optionKey) {
    if (optionLock) return;
    optionLock = true;

    state.answers[state.currentIndex] = optionKey;
    Array.from(els.optionsList.querySelectorAll(".option-btn")).forEach((btn) => {
      btn.classList.toggle("selected", btn.dataset.key === optionKey);
    });

    saveProgress();

    window.setTimeout(() => {
      optionLock = false;
      if (state.currentIndex < CONFIG.questions.length - 1) {
        state.currentIndex += 1;
        renderQuestion(true);
      } else {
        finishCurrentPlayerQuiz();
      }
    }, 180);
  }

  function finishCurrentPlayerQuiz() {
    safeStorageRemove(STORAGE_PROGRESS_KEY);

    // 单人模式
    const soloResult = buildSingleResult(state.answers, state.nicknameA, CONFIG);
    state.currentSoloResult = soloResult;
    safeStorageSet(STORAGE_LATEST_KEY, soloResult);

    if (state.invitedPartner) {
      showCoupleResult(state.invitedPartner, soloResult);
    } else {
      showSoloResult(soloResult);
    }
  }

  /* ==================== SVG 六维雷达图 ==================== */

  function drawRadarSvg(svgEl, dimensions, scoresA, scoresB) {
    const cx = 150;
    const cy = 130;
    const maxR = 82;
    const count = dimensions.length;

    const pointAt = (index, valuePct) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / count;
      const ratio = 0.14 + (Math.max(0, Math.min(100, valuePct)) / 100) * 0.86;
      const r = maxR * ratio;
      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        lx: cx + (maxR + 24) * Math.cos(angle),
        ly: cy + (maxR + 18) * Math.sin(angle)
      };
    };

    const parts = [];

    // 同心六边形网格
    [25, 50, 75, 100].forEach((lvl) => {
      const pts = dimensions
        .map((_, idx) => {
          const p = pointAt(idx, lvl);
          return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        })
        .join(" ");
      parts.push(
        `<polygon points="${pts}" fill="none" stroke="rgba(167, 130, 84, 0.25)" stroke-width="0.9" />`
      );
    });

    // 轴线与文字标签
    dimensions.forEach((dim, idx) => {
      const p = pointAt(idx, 100);
      parts.push(
        `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="rgba(167, 130, 84, 0.25)" stroke-width="0.9" />`
      );
      let anchor = "middle";
      if (p.lx < cx - 15) anchor = "end";
      else if (p.lx > cx + 15) anchor = "start";
      parts.push(
        `<text x="${p.lx.toFixed(1)}" y="${(p.ly + 4).toFixed(1)}" text-anchor="${anchor}" fill="#5c5052" font-size="11" font-weight="500">${dim.shortLabel}</text>`
      );
    });

    // 多边形 A
    const polyPtsA = dimensions
      .map((dim, idx) => {
        const p = pointAt(idx, scoresA[dim.key] || 0);
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(" ");
    parts.push(
      `<polygon points="${polyPtsA}" fill="rgba(158, 66, 77, 0.16)" stroke="#9e424d" stroke-width="1.8" stroke-linejoin="round" />`
    );

    // 若为双人叠层，绘制 B
    if (scoresB) {
      const polyPtsB = dimensions
        .map((dim, idx) => {
          const p = pointAt(idx, scoresB[dim.key] || 0);
          return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        })
        .join(" ");
      parts.push(
        `<polygon points="${polyPtsB}" fill="rgba(167, 130, 84, 0.15)" stroke="#a78254" stroke-width="1.8" stroke-dasharray="4 2" stroke-linejoin="round" />`
      );
    }

    // 顶点圆点
    dimensions.forEach((dim, idx) => {
      const pA = pointAt(idx, scoresA[dim.key] || 0);
      parts.push(`<circle cx="${pA.x.toFixed(1)}" cy="${pA.y.toFixed(1)}" r="2.8" fill="#9e424d" />`);
      if (scoresB) {
        const pB = pointAt(idx, scoresB[dim.key] || 0);
        parts.push(`<circle cx="${pB.x.toFixed(1)}" cy="${pB.y.toFixed(1)}" r="2.8" fill="#a78254" />`);
      }
    });

    svgEl.innerHTML = parts.join("");
  }

  /* ==================== 渲染单人结果页 ==================== */

  function showSoloResult(result) {
    state.currentSoloResult = result;
    const arch = getArchetypeById(result.archetypeId, CONFIG);

    els.soloArchetypeCode.textContent = arch.code;
    els.soloNicknameBadge.textContent = `${result.nickname} · 专属恋爱人格档案`;
    els.soloEmblem.innerHTML = getArchetypeIconSvg(arch.id);
    els.soloArchetypeName.textContent = arch.name;
    els.soloArchetypeEn.textContent = arch.en;
    els.soloQuote.textContent = arch.quote;
    els.soloMiniSummary.textContent = arch.miniSummary;

    els.soloTags.innerHTML = arch.tags.map((t) => `<span class="poster-tag">${t}</span>`).join("");

    drawRadarSvg(els.soloRadarSvg, CONFIG.dimensions, result.scores, null);

    els.soloDimensionBars.innerHTML = CONFIG.dimensions
      .map((dim) => {
        const val = result.scores[dim.key];
        return `
          <div class="dim-row">
            <span class="dim-label">${dim.label}</span>
            <div class="dim-bar-track"><div class="dim-bar-fill" style="width:${val}%"></div></div>
            <span class="dim-score">${val}</span>
          </div>
        `;
      })
      .join("");

    els.soloTraitsText.textContent = arch.traits;
    els.soloReasonsList.innerHTML = result.reasons.map((r) => `<li>${r}</li>`).join("");
    els.soloStrengthText.textContent = arch.strength;
    els.soloBlindspotText.textContent = arch.blindspot;

    const bestCards = arch.bestMatches
      .map((m) => {
        const target = getArchetypeById(m.id, CONFIG);
        return `
          <div class="match-pill-card">
            <div class="match-pill-tag">天选适配原型</div>
            <div class="match-pill-title"><span class="match-pill-icon" aria-hidden="true">${getArchetypeIconSvg(target.id)}</span><span>${target.name}</span></div>
            <div class="match-pill-desc">${m.reason}</div>
          </div>
        `;
      })
      .join("");
    const growthTarget = getArchetypeById(arch.growthMatch.id, CONFIG);
    const growthCard = `
      <div class="match-pill-card">
        <div class="match-pill-tag">磨合成长提醒</div>
        <div class="match-pill-title"><span class="match-pill-icon" aria-hidden="true">${getArchetypeIconSvg(growthTarget.id)}</span><span>${growthTarget.name}</span></div>
        <div class="match-pill-desc">${arch.growthMatch.reason}</div>
      </div>
    `;
    els.soloMatchGrid.innerHTML = bestCards + growthCard;

    els.soloEasterGrid.innerHTML = `
      <div class="easter-item"><div class="easter-label">01 / 恋爱主题曲</div><div class="easter-val">${arch.easterEggs.bgm}</div></div>
      <div class="easter-item"><div class="easter-label">02 / 回消息习惯</div><div class="easter-val">${arch.easterEggs.replyHabit}</div></div>
      <div class="easter-item"><div class="easter-label">03 / 吵架内心 OS</div><div class="easter-val">${arch.easterEggs.quarrelOS}</div></div>
      <div class="easter-item"><div class="easter-label">04 / 幸运约会剧本</div><div class="easter-val">${arch.easterEggs.dateScene}</div></div>
    `;

    els.soloPasscodeDisplay.textContent = result.passcode;
    els.inlineArchDrawer.classList.add("hidden");
    els.inlinePartnerBox.classList.add("hidden");
    els.soloToast.classList.add("hidden");
    applyPaywallState();

    switchView("result");
  }

  /* ==================== 渲染双人适配度页 ==================== */

  function showCoupleResult(personA, personB) {
    const report = computeCoupleCompatibility(personA, personB, CONFIG);
    state.currentCoupleResult = report;

    els.coupleTierCode.textContent = report.tier.code;
    els.coupleNameA.textContent = report.personA.nickname;
    els.coupleArchA.textContent = report.personA.archetype.name;
    els.coupleNameB.textContent = report.personB.nickname;
    els.coupleArchB.textContent = report.personB.archetype.name;

    els.legendNameA.textContent = report.personA.nickname;
    els.legendNameB.textContent = report.personB.nickname;

    els.coupleScoreNum.textContent = String(report.score);
    els.coupleScoreLabel.textContent = report.tier.label;
    els.coupleHeadline.textContent = report.headline;
    els.coupleQuote.textContent = report.tier.quote;

    // 圆环动画
    const circumference = 2 * Math.PI * 58;
    const offset = circumference * (1 - report.score / 100);
    els.coupleScoreRing.style.strokeDashoffset = String(circumference);
    window.requestAnimationFrame(() => {
      els.coupleScoreRing.style.strokeDashoffset = String(offset);
    });

    drawRadarSvg(els.coupleRadarSvg, CONFIG.dimensions, report.personA.scores, report.personB.scores);

    els.coupleDimensionCompare.innerHTML = report.dimDiffs
      .map((d) => {
        return `
          <div class="dim-compare-row">
            <div class="dim-compare-top">
              <span><strong>${d.label}</strong></span>
              <span>${report.personA.nickname} ${d.a} vs ${report.personB.nickname} ${d.b}</span>
            </div>
            <div class="dim-compare-tracks">
              <div class="dim-bar-track"><div class="dim-bar-fill-a" style="width:${d.a}%"></div></div>
              <div class="dim-bar-track"><div class="dim-bar-fill-b" style="width:${d.b}%"></div></div>
            </div>
          </div>
        `;
      })
      .join("");

    els.coupleHarmonyList.innerHTML = report.harmonyPoints.map((t) => `<li>${t}</li>`).join("");
    els.coupleComplementList.innerHTML = report.complementPoints.map((t) => `<li>${t}</li>`).join("");
    els.coupleFrictionList.innerHTML = report.frictionPoints.map((t) => `<li>${t}</li>`).join("");

    els.coupleEasterGrid.innerHTML = `
      <div class="easter-item"><div class="easter-label">01 / 先低头倾向</div><div class="easter-val">${report.easterEggs.firstCoax}</div></div>
      <div class="easter-item"><div class="easter-label">02 / 周末约会剧本</div><div class="easter-val">${report.easterEggs.weekendScript}</div></div>
      <div class="easter-item"><div class="easter-label">03 / 关系化学词</div><div class="easter-val">${report.easterEggs.chemistryTag}</div></div>
      <div class="easter-item"><div class="easter-label">04 / 专属暗号</div><div class="easter-val">${report.easterEggs.secretCode}</div></div>
    `;

    els.backToSoloBtn.classList.toggle("hidden", !state.currentSoloResult);
    applyPaywallState();
    switchView("couple");
  }

  /* ==================== 原生 Canvas 分享长图生成 (1080×1440 PNG) ==================== */

  function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    const chars = Array.from(text);
    let line = "";
    let lines = [];
    for (let i = 0; i < chars.length; i += 1) {
      const testLine = line + chars[i];
      if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
        lines.push(line);
        line = chars[i];
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);
    if (maxLines && lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1) + "…";
    }
    lines.forEach((ln, idx) => {
      ctx.fillText(ln, x, y + idx * lineHeight);
    });
    return y + lines.length * lineHeight;
  }

  function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawCanvasRadar(ctx, cx, cy, maxR, dimensions, scoresA, scoresB) {
    const count = dimensions.length;
    const pt = (idx, val) => {
      const angle = -Math.PI / 2 + (idx * Math.PI * 2) / count;
      const ratio = 0.14 + (Math.max(0, Math.min(100, val)) / 100) * 0.86;
      return {
        x: cx + maxR * ratio * Math.cos(angle),
        y: cy + maxR * ratio * Math.sin(angle),
        lx: cx + (maxR + 42) * Math.cos(angle),
        ly: cy + (maxR + 30) * Math.sin(angle)
      };
    };

    [25, 50, 75, 100].forEach((lvl) => {
      ctx.beginPath();
      dimensions.forEach((_, idx) => {
        const p = pt(idx, lvl);
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.strokeStyle = "rgba(167, 130, 84, 0.28)";
      ctx.lineWidth = 1.6;
      ctx.stroke();
    });

    dimensions.forEach((dim, idx) => {
      const p = pt(idx, 100);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = "rgba(167, 130, 84, 0.28)";
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.fillStyle = "#5c5052";
      ctx.font = '500 22px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.textAlign = p.lx < cx - 25 ? "right" : p.lx > cx + 25 ? "left" : "center";
      ctx.fillText(dim.shortLabel, p.lx, p.ly + 8);
    });

    // A
    ctx.beginPath();
    dimensions.forEach((dim, idx) => {
      const p = pt(idx, scoresA[dim.key] || 0);
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(158, 66, 77, 0.16)";
    ctx.fill();
    ctx.strokeStyle = "#9e424d";
    ctx.lineWidth = 3.2;
    ctx.stroke();

    if (scoresB) {
      ctx.beginPath();
      dimensions.forEach((dim, idx) => {
        const p = pt(idx, scoresB[dim.key] || 0);
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fillStyle = "rgba(167, 130, 84, 0.15)";
      ctx.fill();
      ctx.strokeStyle = "#a78254";
      ctx.lineWidth = 3.2;
      ctx.stroke();
    }
  }

  function drawCanvasEditorialFrame(ctx) {
    const bg = ctx.createLinearGradient(0, 0, 0, 1440);
    bg.addColorStop(0, "#fdfbf8");
    bg.addColorStop(1, "#f5ebe2");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1080, 1440);

    drawRoundedRect(ctx, 42, 42, 996, 1356, 20);
    ctx.strokeStyle = "rgba(58, 42, 44, 0.14)";
    ctx.lineWidth = 2;
    ctx.stroke();

    drawRoundedRect(ctx, 58, 58, 964, 1324, 12);
    ctx.strokeStyle = "rgba(167, 130, 84, 0.34)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawCanvasSealBadge(ctx, cx, cy, archId) {
    ctx.beginPath();
    ctx.arc(cx, cy, 48, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fill();
    ctx.strokeStyle = "rgba(167, 130, 84, 0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(158, 66, 77, 0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();

    const accentColor = (CONFIG.theme && CONFIG.theme.accent) || "#9e424d";
    drawCanvasArchetypeIcon(ctx, cx, cy, archId, accentColor);
  }

  function exportSoloPosterPng() {
    const result = state.currentSoloResult;
    if (!result) return;
    const arch = getArchetypeById(result.archetypeId, CONFIG);
    const bestPartner =
      arch.bestMatches && arch.bestMatches[0] ? getArchetypeById(arch.bestMatches[0].id, CONFIG) : null;

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1440;
    const ctx = canvas.getContext("2d");

    drawCanvasEditorialFrame(ctx);

    // 顶栏
    ctx.fillStyle = "#908284";
    ctx.font = '500 22px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = "left";
    ctx.fillText(`${CONFIG.meta.brandTitle} · 恋爱人格档案`, 96, 114);

    ctx.textAlign = "right";
    ctx.fillStyle = "#9e424d";
    ctx.font = '700 22px "Songti SC", Georgia, serif';
    ctx.fillText(arch.code, 984, 114);

    ctx.beginPath();
    ctx.moveTo(96, 136);
    ctx.lineTo(984, 136);
    ctx.strokeStyle = "rgba(58, 42, 44, 0.12)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 昵称与细线矢量图腾印章
    ctx.textAlign = "center";
    ctx.fillStyle = "#a78254";
    ctx.font = '500 24px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(`${result.nickname} · 专属恋爱人格档案`, 540, 198);

    drawCanvasSealBadge(ctx, 540, 278, arch.id);

    ctx.fillStyle = "#231d1f";
    ctx.font = '700 54px "Songti SC", "Microsoft YaHei", serif';
    ctx.fillText(arch.name, 540, 386);

    ctx.fillStyle = "#908284";
    ctx.font = '500 20px "Songti SC", Georgia, serif';
    ctx.fillText(arch.en.toUpperCase(), 540, 426);

    // 金句卡片（左竖线编辑风）
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillRect(108, 466, 864, 120);
    ctx.fillStyle = "#9e424d";
    ctx.fillRect(108, 466, 5, 120);
    ctx.textAlign = "left";
    ctx.fillStyle = "#231d1f";
    ctx.font = '600 28px "Songti SC", "Microsoft YaHei", serif';
    wrapCanvasText(ctx, arch.quote, 136, 514, 808, 42, 2);

    // 标签
    ctx.textAlign = "center";
    ctx.font = '500 22px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = "#5c5052";
    ctx.fillText(arch.tags.join("   ·   "), 540, 640);

    // 雷达图
    drawCanvasRadar(ctx, 540, 868, 162, CONFIG.dimensions, result.scores, null);

    // 底部总结与天选适配
    ctx.textAlign = "center";
    ctx.fillStyle = "#5c5052";
    ctx.font = '400 24px "PingFang SC", "Microsoft YaHei", sans-serif';
    wrapCanvasText(ctx, arch.miniSummary, 540, 1148, 830, 38, 2);

    if (bestPartner) {
      ctx.fillStyle = "#7f2f39";
      ctx.font = '600 22px "Songti SC", "Microsoft YaHei", serif';
      ctx.fillText(`天选适配原型：${bestPartner.name}（${bestPartner.code}）`, 540, 1258);
    }

    ctx.fillStyle = "#908284";
    ctx.font = '400 20px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText("ARCHIVE VOL.01 · 40道生活切片 · 恋爱人格 × 情侣适配度测试", 540, 1338);

    triggerCanvasDownload(canvas, `恋爱人格-${arch.name}.png`);
  }

  function exportCouplePosterPng() {
    const report = state.currentCoupleResult;
    if (!report) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1440;
    const ctx = canvas.getContext("2d");

    drawCanvasEditorialFrame(ctx);

    ctx.fillStyle = "#908284";
    ctx.font = '500 22px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = "left";
    ctx.fillText(`${CONFIG.meta.brandTitle} · 双人对照档案`, 96, 114);

    ctx.textAlign = "right";
    ctx.fillStyle = "#9e424d";
    ctx.font = '700 22px "Songti SC", Georgia, serif';
    ctx.fillText(report.tier.code, 984, 114);

    ctx.beginPath();
    ctx.moveTo(96, 136);
    ctx.lineTo(984, 136);
    ctx.strokeStyle = "rgba(58, 42, 44, 0.12)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 双方姓名卡片
    drawRoundedRect(ctx, 102, 164, 392, 112, 12);
    ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
    ctx.fill();
    ctx.strokeStyle = "rgba(58, 42, 44, 0.12)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    drawRoundedRect(ctx, 586, 164, 392, 112, 12);
    ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = "#9e424d";
    ctx.font = '600 30px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(report.personA.nickname, 298, 214);
    ctx.fillStyle = "#5c5052";
    ctx.font = '400 22px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(report.personA.archetype.name, 298, 252);

    ctx.fillStyle = "#a78254";
    ctx.font = '400 34px "Songti SC", serif';
    ctx.fillText("×", 540, 228);

    ctx.fillStyle = "#a78254";
    ctx.font = '600 30px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(report.personB.nickname, 782, 214);
    ctx.fillStyle = "#5c5052";
    ctx.font = '400 22px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(report.personB.archetype.name, 782, 252);

    // 匹配度圆环
    ctx.beginPath();
    ctx.arc(540, 394, 84, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(158, 66, 77, 0.14)";
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(540, 394, 84, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * report.score) / 100);
    ctx.strokeStyle = "#9e424d";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.stroke();

    ctx.fillStyle = "#7f2f39";
    ctx.font = '700 58px "Songti SC", serif';
    ctx.fillText(`${report.score}%`, 540, 404);
    ctx.fillStyle = "#a78254";
    ctx.font = '600 22px "PingFang SC", sans-serif';
    ctx.fillText(report.tier.label, 540, 442);

    ctx.fillStyle = "#231d1f";
    ctx.font = '700 38px "Songti SC", "Microsoft YaHei", serif';
    ctx.fillText(report.headline, 540, 536);

    ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
    ctx.fillRect(108, 572, 864, 112);
    ctx.fillStyle = "#9e424d";
    ctx.fillRect(108, 572, 5, 112);
    ctx.textAlign = "left";
    ctx.fillStyle = "#231d1f";
    ctx.font = '600 26px "Songti SC", "Microsoft YaHei", serif';
    wrapCanvasText(ctx, report.tier.quote, 136, 618, 808, 38, 2);

    // 双人雷达图
    ctx.textAlign = "center";
    drawCanvasRadar(ctx, 540, 928, 165, CONFIG.dimensions, report.personA.scores, report.personB.scores);

    // 图例与趣味暗号
    ctx.fillStyle = "#5c5052";
    ctx.font = '500 22px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(
      `● ${report.personA.nickname}（干枯玫瑰）      ● ${report.personB.nickname}（古铜香槟）`,
      540,
      1182
    );

    ctx.fillStyle = "#7f2f39";
    ctx.font = '600 24px "Songti SC", "Microsoft YaHei", serif';
    ctx.fillText(`专属暗号：${report.easterEggs.secretCode}`, 540, 1244);

    ctx.fillStyle = "#908284";
    ctx.font = '400 20px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText("ARCHIVE VOL.01 · 40道生活切片 · 恋爱人格 × 情侣适配度测试", 540, 1338);

    triggerCanvasDownload(canvas, `情侣适配度-${report.score}%.png`);
  }

  let pendingPosterUrl = "";
  let pendingPosterFilename = "poster.png";

  function triggerCanvasDownload(canvas, filename) {
    pendingPosterUrl = canvas.toDataURL("image/png");
    pendingPosterFilename = filename;
    if (els.posterPreviewImg && els.posterPreviewModal) {
      els.posterPreviewImg.src = pendingPosterUrl;
      openModal(els.posterPreviewModal);
      return;
    }
    downloadUrlNow(pendingPosterUrl, pendingPosterFilename);
  }

  function downloadUrlNow(url, filename) {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /* ==================== 剪贴板与事件绑定 ==================== */

  function copyText(text, toastEl, successMsg) {
    const showToast = (msg) => {
      if (!toastEl) return;
      toastEl.textContent = msg;
      toastEl.classList.remove("hidden");
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => showToast(successMsg),
        () => fallbackCopy(text, showToast, successMsg)
      );
    } else {
      fallbackCopy(text, showToast, successMsg);
    }
  }

  function fallbackCopy(text, showToast, successMsg) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      showToast(successMsg);
    } catch (e) {
      showToast("当前浏览器禁止自动复制，请手动长按上方文字复制");
    }
    document.body.removeChild(ta);
  }

  function buildInviteShareMessage(result) {
    const baseUrl = window.location.href.split("?")[0].split("#")[0];
    const arch = getArchetypeById(result.archetypeId, CONFIG);
    const inviteUrl = `${baseUrl}?partner=${encodeURIComponent(result.passcode)}`;
    return `我刚在「心动频率研究所」测出恋爱人格：${arch.name}（${arch.code}）。\n点击链接完成 40 题，即可查看我们的双人适配度档案：${inviteUrl}\n（若直接打开网页，也可在“口令比对”中粘贴我的口令：${result.passcode}）`;
  }

  function resetToHome() {
    setScreenshotMode(false);
    refreshResumeAndLatestHelpers();
    switchView("home");
  }

  function bindEvents() {
    els.brandHomeBtn.addEventListener("click", resetToHome);
    els.topbarResetBtn.addEventListener("click", resetToHome);
    els.openAtlasBtn.addEventListener("click", () => openModal(els.archetypeAtlasModal));
    els.closeAtlasBtn.addEventListener("click", () => closeModal(els.archetypeAtlasModal));
    els.closePosterModalBtn.addEventListener("click", () => closeModal(els.posterPreviewModal));
    els.confirmDownloadPosterBtn.addEventListener("click", () => {
      downloadUrlNow(pendingPosterUrl, pendingPosterFilename);
    });

    [els.archetypeAtlasModal, els.posterPreviewModal].forEach((modalEl) => {
      if (!modalEl) return;
      modalEl.addEventListener("click", (e) => {
        if (e.target === modalEl) closeModal(modalEl);
      });
    });

    els.directNameA.addEventListener("input", updateDirectLivePreview);
    els.directNameB.addEventListener("input", updateDirectLivePreview);

    els.soloUnlockBtn.addEventListener("click", () => {
      tryUnlockPaywall(els.soloUnlockInput, els.soloUnlockHint);
    });
    els.coupleUnlockBtn.addEventListener("click", () => {
      tryUnlockPaywall(els.coupleUnlockInput, els.coupleUnlockHint);
    });

    els.screenshotModeBtn.addEventListener("click", () => setScreenshotMode(!state.screenshotMode));
    els.toggleSoloScreenshotBtn.addEventListener("click", () => setScreenshotMode(!state.screenshotMode));
    els.toggleCoupleScreenshotBtn.addEventListener("click", () => setScreenshotMode(!state.screenshotMode));

    Array.from(els.modeGrid.querySelectorAll(".mode-card")).forEach((card) => {
      card.addEventListener("click", () => selectMode(card.dataset.mode));
    });

    els.clearInviteBtn.addEventListener("click", () => {
      state.invitedPartner = null;
      els.inviteBanner.classList.add("hidden");
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      selectMode(state.mode);
    });

    els.startQuizBtn.addEventListener("click", () => startNewQuiz(false));
    els.resumeQuizBtn.addEventListener("click", () => startNewQuiz(true));

    els.prevQuestionBtn.addEventListener("click", () => {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
        renderQuestion(true);
      }
    });

    els.restartDuringQuizBtn.addEventListener("click", () => {
      safeStorageRemove(STORAGE_PROGRESS_KEY);
      resetToHome();
    });

    // 首页双人人格直接对比（免答题）
    els.runDirectCompareBtn.addEventListener("click", () => {
      const archA = getArchetypeById(state.directArchetypeA, CONFIG);
      const archB = getArchetypeById(state.directArchetypeB, CONFIG);
      const personA = buildPresetResult(
        archA.id,
        els.directNameA.value.trim() || `TA(${archA.name.slice(0, 4)})`,
        CONFIG
      );
      const personB = buildPresetResult(
        archB.id,
        els.directNameB.value.trim() || `你(${archB.name.slice(0, 4)})`,
        CONFIG
      );
      showCoupleResult(personA, personB);
    });

    // 单人结果页：直接选 TA 的人格对比
    els.pickPartnerArchBtn.addEventListener("click", () => {
      els.inlinePartnerBox.classList.add("hidden");
      els.inlineArchDrawer.classList.toggle("hidden");
    });

    els.copyPasscodeBtn.addEventListener("click", () => {
      if (!state.currentSoloResult) return;
      copyText(state.currentSoloResult.passcode, els.soloToast, "已复制合拍口令，可发送给对方进行比对。");
    });

    els.copyInviteLinkBtn.addEventListener("click", () => {
      if (!state.currentSoloResult) return;
      copyText(
        buildInviteShareMessage(state.currentSoloResult),
        els.soloToast,
        "已复制邀请文案与合拍链接。"
      );
    });

    els.enterPartnerCodeBtn.addEventListener("click", () => {
      els.inlineArchDrawer.classList.add("hidden");
      els.inlinePartnerBox.classList.toggle("hidden");
      if (!els.inlinePartnerBox.classList.contains("hidden")) {
        els.inlinePartnerInput.focus();
      }
    });

    els.inlineCompareGoBtn.addEventListener("click", () => {
      const partner = decodePasscode(els.inlinePartnerInput.value, CONFIG);
      if (!partner) {
        els.soloToast.textContent = "未能识别有效的 LOVE- 合拍口令，请检查是否完整粘贴。";
        els.soloToast.classList.remove("hidden");
        return;
      }
      showCoupleResult(state.currentSoloResult, partner);
    });

    // 首页口令直接比对
    els.fillMyLatestBtn.addEventListener("click", () => {
      const latest = safeStorageGet(STORAGE_LATEST_KEY);
      if (latest && latest.passcode) {
        els.passcodeBInput.value = latest.passcode;
        els.compareErrorHint.classList.add("hidden");
      }
    });

    els.runCompareBtn.addEventListener("click", () => {
      const a = decodePasscode(els.passcodeAInput.value, CONFIG);
      const b = decodePasscode(els.passcodeBInput.value, CONFIG);
      if (!a || !b) {
        els.compareErrorHint.textContent = !a
          ? "第一位的合拍口令或链接格式无效，请检查是否完整复制"
          : "第二位的合拍口令或链接格式无效，请检查是否完整复制";
        els.compareErrorHint.classList.remove("hidden");
        return;
      }
      els.compareErrorHint.classList.add("hidden");
      showCoupleResult(a, b);
    });

    els.downloadSoloPosterBtn.addEventListener("click", exportSoloPosterPng);
    els.downloadCouplePosterBtn.addEventListener("click", exportCouplePosterPng);

    els.retakeSoloBtn.addEventListener("click", () => {
      safeStorageRemove(STORAGE_PROGRESS_KEY);
      resetToHome();
    });

    els.retakeCoupleBtn.addEventListener("click", () => {
      state.invitedPartner = null;
      safeStorageRemove(STORAGE_PROGRESS_KEY);
      resetToHome();
    });

    els.backToSoloBtn.addEventListener("click", () => {
      if (state.currentSoloResult) {
        showSoloResult(state.currentSoloResult);
      }
    });

    // 电脑端键盘快捷键（A/B/C/D 或 1/2/3/4）及 Escape 关闭弹窗
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal(els.archetypeAtlasModal);
        closeModal(els.posterPreviewModal);
        return;
      }
      if (!els.views.quiz.classList.contains("active")) return;
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;

      const keyMap = {
        a: "A",
        1: "A",
        b: "B",
        2: "B",
        c: "C",
        3: "C",
        d: "D",
        4: "D"
      };
      const mapped = keyMap[String(e.key).toLowerCase()];
      if (mapped) {
        handleAnswerSelect(mapped);
      } else if (e.key === "ArrowLeft" && state.currentIndex > 0) {
        state.currentIndex -= 1;
        renderQuestion(true);
      }
    });
  }

  function init() {
    applyConfigMeta();
    bindEvents();
    selectMode("solo");
    checkInviteFromUrl();
    refreshResumeAndLatestHelpers();
  }

  init();
})(typeof window !== "undefined" ? window : globalThis);
