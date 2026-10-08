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
      bottom: 82px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: min(420px, calc(100vw - 24px));
      max-height: 24vh;
      overflow: auto;
      pointer-events: none;
    }
    #wedding-guestbook-wishes[hidden],
    #google-sheet-wish-status:empty {
      display: none !important;
    }
    .wedding-guestbook-wish {
      padding: 8px 12px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
      color: #812927;
      font: 14px/1.45 Arial, sans-serif;
      overflow-wrap: anywhere;
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
    "venueAddressDisplay",
  ]);
  const weddingParentNameGroups = [
    ["fxn1f33Y3m", "PvD9attWk4"],
    ["lEdDtKu3Tk", "UT8sz-i1-g"],
  ];

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

  function setTextByNodeId(nodeId, value) {
    if (typeof value !== "string") return;
    document
      .querySelectorAll(`[data-node-id="${nodeId}"]`)
      .forEach((element) => setTextContent(element, value));
  }

  function applyWeddingInfo() {
    const info = window.WEDDING_INFO;
    if (!info || typeof info !== "object") return;

    if (typeof info.pageTitle === "string" && document.title !== info.pageTitle) {
      document.title = info.pageTitle;
    }
    Object.entries(weddingInfoTargets).forEach(([key, nodeIds]) => {
      nodeIds.forEach((nodeId) => {
        setTextByNodeId(nodeId, info[key]);
        if (weddingSingleLineKeys.has(key)) fitWeddingName(nodeId);
      });
    });
    weddingParentNameGroups.forEach(fitWeddingNamesTogether);
    if (Array.isArray(info.scheduleItems)) {
      scheduleItemTargets.forEach((nodeIds, index) => {
        nodeIds.forEach((nodeId) =>
          setTextByNodeId(nodeId, info.scheduleItems[index])
        );
      });
    }

    const replacements = window.WEDDING_TEXT_REPLACEMENTS;
    if (!Array.isArray(replacements)) return;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let textNode = walker.nextNode();
    while (textNode) {
      const replacement = replacements.find(
        (item) =>
          item &&
          typeof item.match === "string" &&
          typeof item.text === "string" &&
          textNode.nodeValue.replace(/\s+/g, " ").trim() ===
            item.match.replace(/\s+/g, " ").trim()
      );
      if (replacement && textNode.nodeValue !== replacement.text) {
        textNode.nodeValue = replacement.text;
      }
      textNode = walker.nextNode();
    }
  }

  function fitWeddingName(nodeId) {
    fitWeddingNames([nodeId]);
  }

  function fitWeddingNamesTogether(nodeIds) {
    fitWeddingNames(nodeIds);
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
        name.style.whiteSpace = "nowrap";
        name.style.wordBreak = "normal";
        name.style.fontSize = `${baseFontSize}px`;

        const availableWidth = name.clientWidth;
        const textWidth = name.scrollWidth;
        const maximumFontSize =
          availableWidth > 0 && textWidth > availableWidth
            ? baseFontSize * (availableWidth / textWidth) * 0.98
            : baseFontSize;
        return { name, baseFontSize, availableWidth, maximumFontSize };
      })
      .filter(Boolean);

    const sharedFontSize =
      nodeIds.length > 1 && measurements.length
        ? Math.max(
            6,
            Math.min(...measurements.map((measurement) => measurement.maximumFontSize))
          )
        : null;

    measurements.forEach(
      ({ name, baseFontSize, availableWidth, maximumFontSize }) => {
        if (nodeIds.length > 1) {
          name.style.fontSize = `${Math.min(
            baseFontSize,
            sharedFontSize,
            maximumFontSize
          )}px`;
        } else if (maximumFontSize < baseFontSize) {
          name.style.fontSize = `${Math.max(6, maximumFontSize)}px`;
        }
        name.dataset.weddingFittedText = name.textContent;
        name.dataset.weddingFittedWidth = String(availableWidth);
      }
    );
  }

  function setupMusic() {
    const musicUrl = String(window.WEDDING_MUSIC_URL || "").trim();
    if (!musicUrl) return;

    const audio = document.querySelector("#app-view-index audio");
    if (!audio) {
      console.error("Wedding music audio element is missing.");
      return;
    }

    if (audio.getAttribute("src") !== musicUrl) {
      audio.setAttribute("src", musicUrl);
      audio.load();
    }
  }

  function removeDesignActions() {
    const designActionLabels = new Set([
      "lưu thiết kế",
      "chỉnh sửa thiết kế",
      "lưu mẫu này",
      "chỉnh sửa mẫu này",
      "thêm vào yêu thích",
    ]);

    document.querySelectorAll('button, [role="button"]').forEach((button) => {
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
    const elements = [];
    if (root instanceof Element && root.matches("img,[style]")) {
      elements.push(root);
    }
    if (root.querySelectorAll) {
      elements.push(...root.querySelectorAll("img,[style]"));
    }

    elements.forEach((element) => {
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

  function setupMapsButton() {
    document.querySelectorAll('iframe[src*="maps.google.com/maps"]').forEach((map) => {
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

  function cleanMapPlaceholders() {
    document
      .querySelectorAll('[data-wedding-map-button="true"]')
      .forEach(removeMapPlaceholder);
  }

  function renderWishes() {
    if (!wishList) return;

    wishList.replaceChildren();
    latestWishes.slice(0, 5).forEach((wish) => {
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
      loadWishes();
    }
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
        currentStatus.textContent = "Đã lưu lời chúc. Cảm ơn bạn!";
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

    const requestId = `${kind}_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}`;
    const frame = document.createElement("iframe");
    frame.name = requestId;
    frame.title = "Kết quả gửi biểu mẫu";
    frame.hidden = true;
    const form = document.createElement("form");
    form.method = "POST";
    form.action = baseUrl;
    form.target = requestId;
    form.hidden = true;

    [
      ["kind", kind],
      ["requestId", requestId],
      ...Object.entries(values),
    ].forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });

    button.disabled = true;
    status.textContent = kind === "rsvp"
      ? "Đang lưu xác nhận tham dự..."
      : "Đang gửi lời chúc...";
    document.body.append(frame, form);

    const cleanup = () => {
      window.removeEventListener("message", handleResponse);
      window.clearTimeout(timeout);
      frame.remove();
      form.remove();
      button.disabled = false;
    };
    const handleResponse = (event) => {
      if (
        event.source !== frame.contentWindow ||
        !event.data ||
        event.data.type !== "wedding-form-result" ||
        event.data.kind !== kind ||
        event.data.requestId !== requestId
      ) {
        return;
      }
      cleanup();
      if (!event.data.ok) {
        onFailure();
        return;
      }
      onSuccess();
    };
    const timeout = window.setTimeout(() => {
      cleanup();
      status.textContent =
        "Gửi dữ liệu bị quá thời gian chờ. Kiểm tra kết nối rồi thử lại.";
    }, 20000);

    window.addEventListener("message", handleResponse);
    try {
      form.submit();
    } catch (error) {
      cleanup();
      status.textContent = "Không gửi được dữ liệu. Vui lòng thử lại.";
      console.error("Unable to submit wedding form:", error);
    }
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
        status.textContent = "Đã lưu xác nhận tham dự. Cảm ơn bạn!";
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
  applyWeddingInfo();
  removeDesignActions();
  setupGuestbook();
  replaceWeddingPhotos();
  document.addEventListener("submit", handleRsvpSubmit, true);
  const pageTitleObserver = new MutationObserver(() => {
    const pageTitle = String(window.WEDDING_INFO?.pageTitle || "").trim();
    if (pageTitle && document.title !== pageTitle) {
      document.title = pageTitle;
    }
  });
  pageTitleObserver.observe(document.head, {
    characterData: true,
    childList: true,
    subtree: true,
  });
  const observer = new MutationObserver(() => {
    setupMusic();
    applyWeddingInfo();
    setupGuestbook();
    setupMapsButton();
    cleanMapPlaceholders();
    replaceWeddingPhotos();
    removeDesignActions();
  });
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["src", "srcset", "style"],
    childList: true,
    subtree: true,
  });
  setupMapsButton();
  window.addEventListener("resize", applyWeddingInfo);
})();
