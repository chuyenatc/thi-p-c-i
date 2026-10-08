(function () {
  "use strict";

  const style = document.createElement("style");
  style.textContent = `
    .watermark,
    .fixed.top-2.left-2,
    #animation-gift-preview-btn,
    #cinelove-gift-button,
    #cinelove-like-button,
    [aria-label*="QR" i],
    [title*="QR" i] {
      display: none !important;
    }
    #blessing-box {
      display: none !important;
    }
    #wedding-guestbook-wishes {
      position: fixed;
      z-index: 30;
      right: 12px;
      bottom: 125px;
      display: none; /* hidden by default, toggled later */
      flex-direction: column;
      gap: 6px;
      width: min(420px, calc(100vw - 24px));
      pointer-events: none;
    }
    #wedding-guestbook-wishes.show-wishes {
      display: flex !important;
    }
    #wedding-guestbook-wishes[hidden],
    #google-sheet-wish-status:empty {
      display: none !important;
    }
    .wedding-guestbook-wish {
      padding: 8px 12px;
      border-radius: 8px;
      background: rgba(255, 192, 203, 0.85); /* Nền hồng mờ */
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
      color: #812927;
      font: 14px/1.45 Arial, sans-serif;
      overflow-wrap: anywhere;
      animation: fadeIn 0.5s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    #google-sheet-wish-status {
      position: fixed;
      z-index: 1001;
      right: 12px;
      bottom: 16px;
      left: 12px;
      color: #812927;
      font: 14px/1.5 Arial, sans-serif;
      text-align: center;
      pointer-events: none;
    }
    .wedding-map-link {
      position: absolute;
      inset: 0;
      display: flex;
      width: 100%;
      height: 100%;
      min-height: 40px;
      align-items: center;
      justify-content: center;
      padding: 8px 14px;
      border-radius: 24px;
      background: #e49696 !important;
      border: 0 !important;
      box-shadow: none !important;
      color: #fff;
      font: 600 14px/1.2 Arial, sans-serif;
      text-align: center;
      text-decoration: none;
      box-sizing: border-box;
      cursor: pointer;
      outline: none !important;
      filter: none !important;
    }
    .wedding-map-link:hover,
    .wedding-map-link:focus,
    .wedding-map-link:focus-visible,
    .wedding-map-link:active {
      background: #e49696 !important;
      color: #fff;
      border: 0 !important;
      box-shadow: none !important;
      outline: none !important;
      filter: none !important;
    }
  `;
  document.head.appendChild(style);

  let wishList = null;
  let status = null;
  let latestWishes = [];

  const weddingInfoTargets = {
    coverHeading: ["jEwFwxPy6x"],
    invitationHeading: ["T_GUXbKvJQ"],
    brideShortName: ["gGIGEA6OsO"],
    groomShortName: ["qwGJp4zhBD"],
    invitationSectionHeading: ["HKFOtc7D8d", "suNBAEdY_U"],
    groomParentsHeading: ["uCv5Voh3eD"],
    groomFather: ["fxn1f33Y3m"],
    groomMother: ["lEdDtKu3Tk"],
    brideParentsHeading: ["Fh53RbqNJ3"],
    brideFather: ["PvD9attWk4"],
    brideMother: ["UT8sz-i1-g"],
    brideFullName: ["JBgwRLwkbL", "Z5yYxBQgzB", "iPjImtIlr4"],
    groomFullName: ["nH7HtbJpq4", "PKNdPfREuu", "vbVsmkFNC_"],
    brideHometown: ["tc9S5S9lDs"],
    groomHometown: ["8B86R18A1v"],
    receptionTitle: ["JFI-scVoG3"],
    ceremonyTime: ["VPUtL1W7Ce"],
    monthLabel: ["sMFaGlobqu"],
    weddingDay: ["8lonBDS1Z_"],
    lunarDate: ["CZJb7cjbFz"],
    venueName: ["e3zKsoJ7VU"],
    venueAddressDisplay: ["CKmU0S7mgD"],
    brideBirthDate: ["xWGqZQdC7S"],
    groomBirthDate: ["kEUw8at2wW"],
    brideProfileHometown: ["Z_sqsL03TS"],
    groomProfileHometown: ["E545CI_VBk"],
    brideProfileLabel: ["O4qFTubpPD"],
    groomProfileLabel: ["3TmdZATszZ"],
    scheduleHeading: ["niEXlWBSJN"],
    scheduleMonthYear: ["dgk-5_grgZ"],
    brideBankDetails: ["t0Ya66JrSt"],
    groomBankDetails: ["D5MLJCGR1T"],
    calendarYearLabel: ["vaCj1ozsWu"],
  };
  const scheduleItemTargets = [
    ["4Q3-6-pwwI"],
    ["pr66tJKC64"],
    ["scGhyU0cqJ"],
  ];
  const weddingSingleLineKeys = new Set([
    "brideShortName",
    "groomShortName",
    "brideFullName",
    "groomFullName",
    "brideBirthDate",
    "groomBirthDate",
    "groomFather",
    "groomMother",
    "brideFather",
    "brideMother",
    "venueAddressDisplay",
    "brideProfileHometown",
    "groomProfileHometown"
  ]);
  const weddingParentNameGroups = [
    ["fxn1f33Y3m", "PvD9attWk4"],
    ["lEdDtKu3Tk", "UT8sz-i1-g"],
  ];
  let cachedTextReplacements = null;
  let cachedTextReplacementSource = null;

  function queryAll(root, selector) {
    const elements = [];
    if (root instanceof Element && root.matches(selector)) {
      elements.push(root);
    }
    if (root.querySelectorAll) {
      elements.push(...root.querySelectorAll(selector));
    }
    return elements;
  }

  function setWeddingPageTitle() {
    document.head.querySelectorAll("meta[content]").forEach((meta) => {
      if (/thiep-cuoi-42|42\s*-\s*Thiệp cưới online miễn phí/i.test(meta.content)) {
        meta.remove();
      }
    });
  }

  function setTextContent(element, value) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let textNode = walker.nextNode();
    while (textNode) {
      textNodes.push(textNode);
      textNode = walker.nextNode();
    }
    if (!textNodes.length) return;
    if (textNodes[0].nodeValue !== value) textNodes[0].nodeValue = value;
    textNodes.slice(1).forEach((node) => {
      if (node.nodeValue) node.nodeValue = "";
    });
  }

  function setTextByNodeId(nodeId, value, root = document) {
    if (typeof value !== "string") return false;
    const targets = queryAll(root, `[data-node-id="${nodeId}"]`);
    targets.forEach((element) => setTextContent(element, value));
    return targets.length > 0;
  }

  function getTextReplacementMap() {
    const replacements = window.WEDDING_TEXT_REPLACEMENTS;
    if (!Array.isArray(replacements)) return null;
    if (replacements !== cachedTextReplacementSource) {
      cachedTextReplacementSource = replacements;
      cachedTextReplacements = new Map();
      replacements.forEach((item) => {
        if (
          !item ||
          typeof item.match !== "string" ||
          typeof item.text !== "string"
        ) {
          return;
        }
        const normalizedMatch = item.match.replace(/\s+/g, " ").trim();
        if (!cachedTextReplacements.has(normalizedMatch)) {
          cachedTextReplacements.set(normalizedMatch, item.text);
        }
      });
    }
    return cachedTextReplacements;
  }

  function applyWeddingInfo(root = document) {
    const info = window.WEDDING_INFO;
    if (!info || typeof info !== "object") return;

    const updatedNodeIds = new Set();
    Object.entries(weddingInfoTargets).forEach(([key, nodeIds]) => {
      nodeIds.forEach((nodeId) => {
        setTextByNodeId(nodeId, info[key], root);
        updatedNodeIds.add(nodeId);
        if (weddingSingleLineKeys.has(key)) fitWeddingName(nodeId);
      });
    });
    weddingParentNameGroups.forEach((nodeIds) => {
      fitWeddingNamesTogether(nodeIds);
    });
    if (Array.isArray(info.scheduleItems)) {
      scheduleItemTargets.forEach((nodeIds, index) => {
        nodeIds.forEach((nodeId) =>
          setTextByNodeId(nodeId, info.scheduleItems[index], root)
        );
      });
    }

    // Force override calendar for October 2026
    const calendarWrappers = queryAll(root, '.template-three');
    calendarWrappers.forEach(cal => {
      if (cal.querySelector('.fixedForOct2026Marker')) return;
      
      let html = "<div class='fixedForOct2026Marker' style='display:none'></div>";
      // October 2026 starts on Thursday. Mon=1, Tue=2, Wed=3 -> 3 empty blocks
      html += "<div></div>".repeat(3);
      for (let i = 1; i <= 31; i++) {
        if (i === 25) {
          html += `<div style="position:relative;display:flex;align-items:center;justify-content:center;"><img class="heart-date" src="images/calen_heart_1.png" alt="heart" style="width:100%;height:100%;position:absolute;top:0;left:0;z-index:0;"/><div class="colorF" style="position:relative;z-index:1;color:white;">25</div></div>`;
        } else {
          html += `<div><div style="position:relative;z-index:1;">${i}</div></div>`;
        }
      }
      cal.innerHTML = html;
    });

    const replacementsByText = getTextReplacementMap();
    if (!replacementsByText) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let textNode = walker.nextNode();
    while (textNode) {
      const replacement = replacementsByText.get(
        textNode.nodeValue.replace(/\s+/g, " ").trim()
      );
      if (replacement !== undefined && textNode.nodeValue !== replacement) {
        textNode.nodeValue = replacement;
      }
      textNode = walker.nextNode();
    }

    if (info.aboutUsNameFontSize) {
      ["Z5yYxBQgzB", "PKNdPfREuu"].forEach((nodeId) => {
        document.querySelectorAll(
          `.text-box-component[data-node-id="${nodeId}"] [contenteditable="false"]`
        ).forEach((el) => {
          el.style.fontSize = info.aboutUsNameFontSize;
          el.dataset.weddingBaseFontSize = ""; // Reset to allow recalculating fit
        });
        fitWeddingName(nodeId);
      });
    }
  }

  function fitWeddingName(nodeId) {
    fitWeddingNames([nodeId]);
  }

  function fitWeddingNamesTogether(nodeIds) {
    fitWeddingNames(nodeIds);
  }

  function measureTextWidth(text, fontSize, element) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const computed = getComputedStyle(element);
    const fontFamily = computed.fontFamily || "sans-serif";
    const fontWeight = computed.fontWeight || "normal";
    const fontStyle = computed.fontStyle || "normal";
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    return ctx.measureText(text).width;
  }

  function getContainerWidth(element) {
    const textBox = element.closest(".text-box-component");
    if (textBox) {
      const rect = textBox.getBoundingClientRect();
      if (rect.width > 0) return rect.width;
    }
    let parent = element.parentElement;
    while (parent && parent !== document.body) {
      const rect = parent.getBoundingClientRect();
      if (rect.width > 0) return rect.width;
      parent = parent.parentElement;
    }
    return 0;
  }

  function fitWeddingNames(nodeIds) {
    const names = nodeIds.flatMap((nodeId) =>
      Array.from(
        document.querySelectorAll(
          `.text-box-component[data-node-id="${nodeId}"] [contenteditable="false"]`
        )
      )
    );
    const measurements = names
      .map((name) => {
        const baseFontSize =
          Number(name.dataset.weddingBaseFontSize) ||
          parseFloat(name.style.fontSize);
        if (!Number.isFinite(baseFontSize) || baseFontSize <= 0) return null;
        if (!name.dataset.weddingBaseFontSize) {
          name.dataset.weddingBaseFontSize = String(baseFontSize);
        }
        name.style.fontSize = `${baseFontSize}px`;

        const text = name.textContent || "";
        const textWidth = measureTextWidth(text, baseFontSize, name);

        let availableWidth = getContainerWidth(name);
        if (availableWidth <= 0) availableWidth = name.clientWidth;
        if (availableWidth <= 0) {
          const parent = name.parentElement;
          if (parent) availableWidth = parent.getBoundingClientRect().width;
        }

        const maximumFontSize =
          availableWidth > 0 && textWidth > availableWidth
            ? baseFontSize * (availableWidth / textWidth) * 0.98
            : baseFontSize;
        return {
          name,
          baseFontSize,
          availableWidth,
          maximumFontSize,
          measurementKey: `${text}|${availableWidth}|${baseFontSize}`,
        };
      })
      .filter(Boolean);

    const groupsNeedUpdate = measurements.some(
      ({ name, measurementKey }) =>
        name.dataset.weddingFittedMeasurement !== measurementKey
    );
    if (!groupsNeedUpdate) return;

    const sharedFontSize =
      nodeIds.length > 1 && measurements.length
        ? Math.max(
          1,
          Math.min(...measurements.map((measurement) => measurement.maximumFontSize))
        )
        : null;

    measurements.forEach(
      ({ name, baseFontSize, availableWidth, maximumFontSize }) => {
        let finalSize = baseFontSize;
        if (nodeIds.length > 1) {
          finalSize = Math.min(baseFontSize, sharedFontSize, maximumFontSize);
        } else if (maximumFontSize < baseFontSize) {
          finalSize = Math.max(1, maximumFontSize);
        }
        name.style.fontSize = `${finalSize}px`;
        name.style.whiteSpace = "nowrap";
        name.style.overflow = "visible";
        name.style.textAlign = "center";
        name.style.display = "block";
        name.style.width = "100%";

        name.dataset.weddingFittedText = name.textContent;
        name.dataset.weddingFittedWidth = String(availableWidth);
        name.dataset.weddingFittedMeasurement =
          `${name.textContent}|${availableWidth}|${baseFontSize}`;
      }
    );
  }

  function setupMusic(root = document) {
    const musicUrl = String(window.WEDDING_MUSIC_URL || "").trim();
    if (!musicUrl) return;

    const audio = queryAll(root, "#app-view-index audio")[0];
    if (!audio) {
      if (root === document) {
        console.error("Wedding music audio element is missing.");
      }
      return;
    }

    if (audio.getAttribute("src") !== musicUrl) {
      audio.setAttribute("src", musicUrl);
      audio.load();
    }
  }

  function removeDesignActions(root = document) {
    const designActionLabels = new Set([
      "lưu thiết kế",
      "chỉnh sửa thiết kế",
      "lưu mẫu này",
      "chỉnh sửa mẫu này",
      "thêm vào yêu thích",
    ]);

    queryAll(root, 'button, [role="button"]').forEach((button) => {
      const labels = [
        button.textContent,
        button.getAttribute("aria-label"),
        button.getAttribute("title"),
      ];
      const matchesDesignAction = labels.some((label) =>
        designActionLabels.has(
          String(label || "")
            .trim()
            .replace(/\s+/g, " ")
            .toLocaleLowerCase("vi")
        )
      );

      if (matchesDesignAction) button.remove();
    });
  }

  function endpoint() {
    return String(window.WEDDING_GUESTBOOK_ENDPOINT || "").trim();
  }

  function photoPath(value) {
    const photos = window.WEDDING_PHOTO_FILES || {};
    return String(value).replace(/https?:\/\/[^"'()\s]+/g, (url) => {
      try {
        const filename = new URL(url).pathname.split("/").pop();
        const localPath = photos[filename];
        return localPath ? new URL(localPath, document.baseURI).href : url;
      } catch (error) {
        console.error("Unable to resolve wedding photo URL:", error);
        return url;
      }
    });
  }

  function replaceWeddingPhotos(root = document) {
    queryAll(root, "img,[style]").forEach((element) => {
      if (element instanceof HTMLImageElement) {
        const source = element.getAttribute("src");
        const localSource = source && photoPath(source);
        if (localSource && localSource !== source) {
          element.setAttribute("src", localSource);
        }
        const srcset = element.getAttribute("srcset");
        const localSrcset = srcset && photoPath(srcset);
        if (localSrcset && localSrcset !== srcset) {
          element.setAttribute("srcset", localSrcset);
        }
      }

      const background = element.style.backgroundImage;
      if (background) {
        const localBackground = photoPath(background);
        if (localBackground !== background) {
          element.style.backgroundImage = localBackground;
        }
      }
    });
  }

  function setupMapsButton(root = document) {
    queryAll(root, 'iframe[src*="maps.google.com/maps"]').forEach((map) => {
      const container = map.parentElement;
      if (!container) return;

      const source = new URL(map.src);
      const destination =
        String(window.WEDDING_INFO?.venueAddress || "").trim() ||
        source.searchParams.get("q");
      if (!destination) {
        console.error("Google Maps iframe is missing its destination.");
        return;
      }

      let mapBlock = container;
      while (
        mapBlock.parentElement &&
        mapBlock.style.position !== "absolute" &&
        mapBlock !== document.body
      ) {
        mapBlock = mapBlock.parentElement;
      }
      if (mapBlock.style.position === "absolute") {
        mapBlock.style.height = "40px";
        mapBlock.style.minHeight = "40px";
        mapBlock.style.setProperty("background-color", "transparent", "important");
        mapBlock.style.setProperty("background-image", "none", "important");
        mapBlock.style.setProperty("box-shadow", "none", "important");
      }

      let oldMapBlock = container;
      while (oldMapBlock.parentElement && oldMapBlock.parentElement !== mapBlock) {
        oldMapBlock = oldMapBlock.parentElement;
      }
      if (oldMapBlock.parentElement === mapBlock) {
        oldMapBlock.remove();
      } else {
        map.remove();
      }

      const link = document.createElement("a");
      link.className = "wedding-map-link";
      const customMapUrl = String(window.WEDDING_MAP_URL || "").trim();
      let mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
      if (customMapUrl) {
        try {
          const parsedMapUrl = new URL(customMapUrl);
          if (!["https:", "http:"].includes(parsedMapUrl.protocol)) {
            throw new Error("Google Maps URL must use HTTP or HTTPS.");
          }
          mapUrl = parsedMapUrl.href;
        } catch (error) {
          console.error("Invalid custom Google Maps URL:", error);
        }
      }
      link.href = mapUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = String(
        window.WEDDING_INFO?.mapButtonLabel || "Xem đường đi"
      );
      link.setAttribute("aria-label", `Xem đường đi đến ${destination}`);
      mapBlock.appendChild(link);
      mapBlock.dataset.weddingMapButton = "true";
      removeMapPlaceholder(mapBlock);
    });
  }

  function removeMapPlaceholder(mapBlock) {
    const mapTop = parseFloat(mapBlock.style.top);
    const mapLeft = parseFloat(mapBlock.style.left);
    const mapWidth = parseFloat(mapBlock.style.width);
    if (
      !mapBlock.parentElement ||
      !Number.isFinite(mapTop) ||
      !Number.isFinite(mapLeft) ||
      !Number.isFinite(mapWidth)
    ) {
      return;
    }

    [...mapBlock.parentElement.children].forEach((sibling) => {
      if (
        sibling === mapBlock ||
        !sibling.querySelector("svg") ||
        getComputedStyle(sibling).position !== "absolute"
      ) {
        return;
      }

      const top = parseFloat(sibling.style.top);
      const left = parseFloat(sibling.style.left);
      const width = parseFloat(sibling.style.width);
      if (
        Number.isFinite(top) &&
        Number.isFinite(left) &&
        Number.isFinite(width) &&
        Math.abs(top - mapTop) < 12 &&
        Math.abs(left - mapLeft) < 12 &&
        width >= mapWidth * 0.8 &&
        width <= mapWidth * 1.2
      ) {
        sibling.remove();
      }
    });
  }

  function cleanMapPlaceholders(root = document) {
    queryAll(root, '[data-wedding-map-button="true"]')
      .forEach(removeMapPlaceholder);
  }

  function renderWishes() {
    if (!wishList) return;

    wishList.replaceChildren();
    latestWishes.slice(0, 3).forEach((wish) => {
      const message = document.createElement("div");
      message.className = "wedding-guestbook-wish";
      const name = document.createElement("strong");
      name.textContent = wish.name;
      message.append(name, document.createTextNode(`: ${wish.message}`));
      wishList.appendChild(message);
    });
    wishList.hidden = latestWishes.length === 0;
  }

  function loadWishes() {
    const baseUrl = endpoint();
    if (!baseUrl || !wishList) return;

    const callbackName = `__weddingWishes_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      delete window[callbackName];
      script.remove();
      showListError();
    }, 15000);

    window[callbackName] = (result) => {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
      if (!Array.isArray(result)) {
        showListError();
        return;
      }
      latestWishes = result
        .filter(
          (wish) =>
            wish &&
            typeof wish.name === "string" &&
            typeof wish.message === "string"
        )
        .map((wish) => ({
          name: wish.name.slice(0, 25),
          message: wish.message.slice(0, 1000),
        }));
      renderWishes();
    };
    script.onerror = () => {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
      showListError();
    };
    script.src = `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}action=list&callback=${callbackName}`;
    document.head.appendChild(script);
  }

  function showListError() {
    if (status) {
      status.textContent = "Không tải được lời chúc. Vui lòng thử tải lại trang.";
    }
  }

  function setupGuestbook() {
    if (!wishList) {
      wishList = document.createElement("div");
      wishList.id = "wedding-guestbook-wishes";
      wishList.setAttribute("aria-live", "polite");
      wishList.hidden = true;
      document.body.appendChild(wishList);
      status = document.createElement("div");
      status.id = "google-sheet-wish-status";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      document.body.appendChild(status);

      // Create toggle label
      const toggleLabel = document.createElement("label");
      toggleLabel.id = "wish-toggle-label";
      toggleLabel.style.cssText = "position:fixed;bottom:82px;right:12px;z-index:40;display:flex;align-items:center;background:rgba(255,192,203,0.9);padding:6px 12px;border-radius:20px;cursor:pointer;font-size:13px;color:#812927;box-shadow:0 2px 5px rgba(0,0,0,0.2);font-family:Arial,sans-serif;";
      const toggleInput = document.createElement("input");
      toggleInput.type = "checkbox";
      toggleInput.style.marginRight = "6px";
      toggleInput.onchange = (e) => {
        if (e.target.checked) {
          wishList.classList.add("show-wishes");
        } else {
          wishList.classList.remove("show-wishes");
        }
      };
      toggleLabel.appendChild(toggleInput);
      toggleLabel.appendChild(document.createTextNode("Hiện lời chúc"));
      document.body.appendChild(toggleLabel);

      loadWishes();

      // Auto cycle wishes
      setInterval(() => {
        if (latestWishes.length > 3) {
          latestWishes.push(latestWishes.shift());
          renderWishes();
        }
      }, 3500);
    }
  }

  function showToast(message) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.cssText = "position:fixed;bottom:50px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:#fff;padding:12px 24px;border-radius:24px;z-index:9999;font-size:14px;transition:opacity 0.4s;opacity:0;font-family:Arial,sans-serif;text-align:center;max-width:80%;";
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.style.opacity = "1");
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  function statusElement() {
    return status;
  }

  function addWishToList(name, message) {
    latestWishes.unshift({ name, message });
    latestWishes = latestWishes.slice(0, 5);
    renderWishes();
  }

  function submitWish(button) {
    const popup = document.getElementById("blessing-box-popup");
    const nameInput = popup && popup.querySelector(".bar-m-name");
    const messageInput = popup && popup.querySelector(".bar-m-mess");
    if (!popup || !nameInput || !messageInput) return;

    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    const currentStatus = statusElement();
    if (!name || !message) {
      currentStatus.textContent = "Vui lòng nhập tên và lời chúc.";
      return;
    }
    if (name.length > 25 || message.length > 1000) {
      currentStatus.textContent =
        "Tên tối đa 25 ký tự, lời chúc tối đa 1.000 ký tự.";
      return;
    }

    const baseUrl = endpoint();
    if (!baseUrl) {
      currentStatus.textContent =
        "Chưa kết nối Google Sheets. Hãy cấu hình URL Apps Script trước khi gửi.";
      return;
    }

    submitToSheet(
      button,
      "wish",
      { name, message },
      () => {
        addWishToList(name, message);
        currentStatus.textContent = "";
        showToast(window.WEDDING_INFO.wishThankYouText || "Đã lưu lời chúc. Cảm ơn bạn!");
        nameInput.value = "";
        messageInput.value = "";
        const closeButton = popup.querySelector(".icon-guanbi");
        if (closeButton) closeButton.click();
      },
      () => {
        currentStatus.textContent =
          "Chưa gửi được lời chúc. Vui lòng thử lại sau.";
      }
    );
  }

  function submitToSheet(button, kind, values, onSuccess, onFailure) {
    const baseUrl = endpoint();
    if (!baseUrl) {
      status.textContent =
        "Chưa kết nối Google Sheets. Hãy cấu hình URL Apps Script trước khi gửi.";
      return;
    }

    const formData = new URLSearchParams();
    formData.append("kind", kind);
    formData.append("requestId", `${kind}_${Date.now()}`);
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    button.disabled = true;
    status.textContent = kind === "rsvp"
      ? "Đang lưu xác nhận tham dự..."
      : "Đang gửi lời chúc...";

    fetch(baseUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString()
    })
      .then(() => {
        onSuccess();
      })
      .catch((error) => {
        console.error("Unable to submit wedding form:", error);
        status.textContent = "Không gửi được dữ liệu. Vui lòng thử lại.";
        onFailure();
      })
      .finally(() => {
        button.disabled = false;
      });
  }

  function handleRsvpSubmit(event) {
    const form = event.target;
    if (
      !(form instanceof HTMLFormElement) ||
      !form.querySelector('[name="rsvp-name"]')
    ) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    const name = form.querySelector('[name="rsvp-name"]').value.trim();
    const attendance = form.querySelector(
      '[name="rsvp-attendance"]:checked'
    )?.value;
    const attendeeCount = form.querySelector("select")?.value || "1";
    const button = form.querySelector('button[type="submit"]');

    if (!name) {
      status.textContent = "Vui lòng nhập họ tên để xác nhận tham dự.";
      form.querySelector('[name="rsvp-name"]').focus();
      return;
    }
    if (!attendance || !/^(?:[1-9]|10)$/.test(attendeeCount)) {
      status.textContent = "Vui lòng kiểm tra thông tin xác nhận tham dự.";
      return;
    }
    if (!button) {
      console.error("RSVP form is missing its submit button.");
      status.textContent = "Không thể gửi xác nhận. Vui lòng tải lại trang.";
      return;
    }

    submitToSheet(
      button,
      "rsvp",
      { name, attendance, attendeeCount },
      () => {
        status.textContent = "";
        showToast(window.WEDDING_INFO.rsvpThankYouText || "Đã lưu xác nhận tham dự. Cảm ơn bạn!");
        form.reset();
      },
      () => {
        status.textContent =
          "Chưa lưu được xác nhận tham dự. Vui lòng thử lại.";
      }
    );
  }

  document.addEventListener(
    "click",
    (event) => {
      const button =
        event.target instanceof Element &&
        event.target.closest("#blessing-box-popup button");
      if (!button || button.textContent.trim() !== "Gửi Lời Chúc") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      submitWish(button);
    },
    true
  );

  setupMusic();
  setWeddingPageTitle();
  applyWeddingInfo();
  removeDesignActions();
  setupGuestbook();
  replaceWeddingPhotos();
  document.addEventListener("submit", handleRsvpSubmit, true);
  const pendingRoots = new Set();
  const pendingPhotoElements = new Set();
  const pendingMapElements = new Set();
  let mutationFrame = 0;

  const scheduleMutationWork = () => {
    if (mutationFrame) return;
    mutationFrame = window.requestAnimationFrame(() => {
      mutationFrame = 0;
      const roots = Array.from(pendingRoots).filter(
        (root) =>
          !Array.from(pendingRoots).some(
            (otherRoot) => otherRoot !== root && otherRoot.contains(root)
          )
      );
      pendingRoots.clear();
      roots.forEach((root) => {
        applyWeddingInfo(root);
        setupMusic(root);
        removeDesignActions(root);
        replaceWeddingPhotos(root);
        setupMapsButton(root);
        cleanMapPlaceholders(root);
      });

      pendingPhotoElements.forEach((element) => {
        if (!roots.some((root) => root === element || root.contains(element))) {
          replaceWeddingPhotos(element);
        }
      });
      pendingPhotoElements.clear();

      pendingMapElements.forEach((element) => {
        if (!roots.some((root) => root === element || root.contains(element))) {
          setupMapsButton(element);
        }
      });
      pendingMapElements.clear();
    });
  };

  const observer = new MutationObserver((records) => {
    records.forEach((record) => {
      if (record.type === "characterData") {
        const parent = record.target.parentElement;
        const root = parent?.closest("[data-node-id]") || parent;
        if (root) pendingRoots.add(root);
        scheduleMutationWork();
        return;
      }
      if (record.type === "attributes") {
        if (!(record.target instanceof Element)) return;
        if (record.attributeName === "style") {
          const background =
            record.target instanceof HTMLElement
              ? record.target.style.backgroundImage
              : "";
          const photoFiles = window.WEDDING_PHOTO_FILES || {};
          if (
            !background ||
            !Object.keys(photoFiles).some((filename) =>
              background.includes(filename)
            )
          ) {
            return;
          }
        }
        pendingPhotoElements.add(record.target);
        if (
          record.attributeName === "src" &&
          record.target.matches('iframe[src*="maps.google.com/maps"]')
        ) {
          pendingMapElements.add(record.target);
        }
        scheduleMutationWork();
        return;
      }
      if (record.target instanceof Element) {
        pendingRoots.add(
          record.target.closest("[data-node-id]") || record.target
        );
      }
      record.addedNodes.forEach((node) => {
        const element = node instanceof Element ? node : node.parentElement;
        if (element) {
          pendingRoots.add(element.closest("[data-node-id]") || element);
        }
      });
      if (record.addedNodes.length) scheduleMutationWork();
    });
  });
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["src", "srcset", "style"],
    characterData: true,
    childList: true,
    subtree: true,
  });
  window.addEventListener("load", () => {
    applyWeddingInfo();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => applyWeddingInfo());
    }
  }, { once: true });
  setupMapsButton();
  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      resizeFrame = 0;
      Object.entries(weddingInfoTargets).forEach(([key, nodeIds]) => {
        if (weddingSingleLineKeys.has(key)) {
          nodeIds.forEach(fitWeddingName);
        }
      });
      weddingParentNameGroups.forEach(fitWeddingNamesTogether);
    });
  });
})();
