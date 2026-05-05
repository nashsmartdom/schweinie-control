class SchweinieControlCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._mapUrl = null;
    this._lastMapToken = null;
    this._selectedRooms = new Set();
  }

  setConfig(config) {
    this._config = {
      vacuum: "vacuum.schweinie",
      map: "camera.schweinie_map",
      status: "sensor.schweinie_status",
      battery: "sensor.schweinie_battery_level",
      room: "sensor.schweinie_current_room",
      area: "sensor.schweinie_cleaned_area",
      time: "sensor.schweinie_cleaning_time",
      progress: "sensor.schweinie_cleaning_progress",
      suction: "select.schweinie_suction_level",
      mode: "select.schweinie_cleaning_mode",
      route: "select.schweinie_cleaning_route",
      humidity: "select.schweinie_mop_pad_humidity",
      repeats: "select.schweinie_control_repeats",
      autoEmptyButton: "button.schweinie_start_auto_empty",
      selfCleanButton: "button.schweinie_self_clean",
      dryingButton: "button.schweinie_manual_drying",
      rooms: [
        { id: 1, name: "Küche", points: "37,58 54,58 54,83 37,83" },
        { id: 2, name: "Flur", points: "39,20 58,20 58,58 54,58 54,66 38,66 38,51 33,51 33,32 39,32" },
        { id: 3, name: "Alisa", points: "10,55 37,55 37,84 10,84" },
        { id: 4, name: "Julia", points: "10,31 38,31 38,55 10,55" },
        { id: 5, name: "Badezimmer", points: "66,30 98,30 98,44 66,44" },
        { id: 6, name: "Wohnzimmer Teppich", points: "66,68 98,68 98,90 66,90" },
        { id: 7, name: "Schlafzimmer", points: "12,4 43,4 43,28 12,28" },
        { id: 8, name: "Wohnzimmer", points: "58,44 98,44 98,68 58,68" },
      ],
      ...config,
    };
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  getCardSize() {
    return 8;
  }

  state(entity) {
    return this._hass?.states?.[entity];
  }

  value(entity, fallback = "—") {
    const state = this.state(entity);
    if (!state || state.state === "unknown" || state.state === "unavailable") return fallback;
    return state.state;
  }

  unit(entity) {
    return this.state(entity)?.attributes?.unit_of_measurement || "";
  }

  callService(domain, service, data = {}) {
    this._hass.callService(domain, service, data);
  }

  select(entity, option) {
    this.callService("select", "select_option", { entity_id: entity, option });
  }

  press(entity) {
    this.callService("button", "press", { entity_id: entity });
  }

  vacuum(service) {
    this.callService("vacuum", service, { entity_id: this._config.vacuum });
  }

  toggleRoom(roomId) {
    if (this._selectedRooms.has(roomId)) {
      this._selectedRooms.delete(roomId);
    } else {
      this._selectedRooms.add(roomId);
    }
    this.render();
  }

  selectedRoomNames() {
    const byId = new Map(this._config.rooms.map((room) => [room.id, room.name]));
    return Array.from(this._selectedRooms)
      .sort((a, b) => a - b)
      .map((id) => byId.get(id) || String(id));
  }

  selectedText() {
    const names = this.selectedRoomNames();
    return names.length ? names.join(", ") : "Keine";
  }

  startSelected() {
    const rooms = Array.from(this._selectedRooms).sort((a, b) => a - b);
    if (!rooms.length) {
      this.callService("persistent_notification", "create", {
        title: "Schweinie",
        message: "Keine Zimmer ausgewählt.",
      });
      return;
    }

    const repeats = Number.parseInt(this.value(this._config.repeats, "1"), 10) || 1;
    this.callService("schweinie_control", "clean_rooms", { rooms, repeats });
  }

  getMapUrl() {
    const mapState = this.state(this._config.map);
    const token = mapState?.attributes?.access_token || "";
    if (!this._mapUrl || this._lastMapToken !== token) {
      this._lastMapToken = token;
      this._mapUrl = `/api/camera_proxy/${this._config.map}${token ? `?token=${token}` : ""}`;
    }
    return this._mapUrl;
  }

  render() {
    if (!this._hass) return;

    const cfg = this._config;
    const vacuum = this.value(cfg.vacuum);
    const status = this.value(cfg.status, vacuum);
    const battery = this.value(cfg.battery);
    const room = this.value(cfg.room);
    const area = this.value(cfg.area);
    const time = this.value(cfg.time);
    const progress = this.value(cfg.progress);
    const mapUrl = this.getMapUrl();

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
          overflow-x: hidden;
        }
        *, *::before, *::after { box-sizing: border-box; }
        ha-card {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          border-radius: 24px;
          overflow: hidden;
          background: #101010;
          color: var(--primary-text-color);
          box-shadow: var(--ha-card-box-shadow, none);
        }
        .wrap {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          overflow-x: hidden;
          padding: 14px;
          display: grid;
          gap: 12px;
        }
        .headline {
          min-width: 0;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 10px;
          align-items: center;
          padding: 4px 2px 0;
        }
        .title { font-size: 22px; font-weight: 750; letter-spacing: -.02em; }
        .sub { color: var(--secondary-text-color); font-size: 13px; margin-top: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pill {
          border-radius: 999px;
          background: rgba(255,255,255,.08);
          padding: 8px 12px;
          font-weight: 700;
          font-size: 13px;
          white-space: nowrap;
          max-width: 72px;
          overflow: hidden;
          text-overflow: clip;
        }
        .map {
          position: relative;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          border-radius: 20px;
          overflow: hidden;
          background: #050505;
          border: 1px solid rgba(255,255,255,.08);
        }
        .map img {
          display: block;
          width: 100%;
          max-width: 100%;
          height: auto;
          min-height: 0;
          object-fit: contain;
          background: #050505;
          user-select: none;
          -webkit-user-drag: none;
        }
        .room-overlay {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
          pointer-events: none;
        }
        .room-poly {
          pointer-events: auto;
          cursor: pointer;
          fill: rgba(255,255,255,0);
          stroke: rgba(255,255,255,0);
          stroke-width: 0;
          outline: none;
          -webkit-tap-highlight-color: transparent;
        }
        .room-poly.selected {
          fill: rgba(41,169,255,.20);
          stroke: rgba(41,169,255,.85);
          stroke-width: 1.2;
        }
        .check {
          pointer-events: none;
          opacity: 0;
        }
        .check-bg {
          fill: rgba(41,169,255,.92);
          stroke: rgba(255,255,255,.52);
          stroke-width: .8;
        }
        .check-text {
          fill: #fff;
          font-size: 6px;
          font-weight: 800;
          text-anchor: middle;
          dominant-baseline: central;
        }
        .check.selected { opacity: 1; }
        .floating {
          position: absolute;
          top: 10px;
          right: 10px;
          display: grid;
          grid-template-columns: repeat(2, 44px);
          gap: 7px;
          max-width: calc(100% - 20px);
          z-index: 3;
        }
        .mini {
          appearance: none;
          -webkit-appearance: none;
          width: 44px;
          height: 44px;
          border: 1px solid rgba(255,255,255,.14);
          border-radius: 16px;
          background: rgba(0,0,0,.76);
          color: white;
          font-size: 20px;
          cursor: pointer;
          backdrop-filter: blur(8px);
          box-shadow: 0 8px 24px rgba(0,0,0,.28);
          padding: 0;
        }
        .mini.active {
          color: #29a9ff;
          border-color: rgba(41,169,255,.58);
          background: rgba(41,169,255,.18);
        }
        .stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; min-width: 0; }
        .stat, .tile, .action {
          min-width: 0;
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(255,255,255,.045);
          border-radius: 18px;
          min-height: 62px;
          padding: 12px;
        }
        .stat .k { color: var(--secondary-text-color); font-size: 12px; }
        .stat .v { font-size: 18px; font-weight: 750; margin-top: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .grid3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; min-width: 0; }
        .grid4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; min-width: 0; }
        .tile, .action {
          display: grid;
          place-items: center;
          text-align: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }
        .tile .ico, .action .ico { font-size: 28px; line-height: 1; }
        .tile .label, .action .label { font-size: 15px; font-weight: 720; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
        .tile.active {
          border-color: rgba(41,169,255,.55);
          background: rgba(41,169,255,.13);
          color: #29a9ff;
        }
        .action.primary {
          border-color: rgba(76, 175, 80, .42);
          background: rgba(76, 175, 80, .13);
        }
        .action.danger {
          border-color: rgba(244, 67, 54, .38);
          background: rgba(244, 67, 54, .12);
        }
        .section-title { font-size: 13px; color: var(--secondary-text-color); font-weight: 700; padding-left: 3px; margin-top: 2px; }
        @media (max-width: 520px) {
          .wrap { padding: 12px; gap: 10px; }
          .title { font-size: 21px; }
          .pill { max-width: 60px; padding: 7px 10px; }
          .floating { grid-template-columns: repeat(2, 40px); gap: 6px; top: 8px; right: 8px; }
          .mini { width: 40px; height: 40px; border-radius: 14px; font-size: 18px; }
          .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .grid4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .grid3 { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
          .tile, .action, .stat { padding: 10px; }
        }
      </style>

      <ha-card>
        <div class="wrap">
          <div class="headline">
            <div>
              <div class="title">Schweinie</div>
              <div class="sub">${status} · ${room}</div>
            </div>
            <div class="pill">${battery}${this.unit(cfg.battery)}</div>
          </div>

          <div class="map">
            <img src="${mapUrl}" />
            <svg class="room-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
              ${cfg.rooms.map((roomCfg) => this.zone(roomCfg)).join("")}
              ${cfg.rooms.map((roomCfg) => this.check(roomCfg)).join("")}
            </svg>
            <div class="floating">
              ${this.quickButton(cfg.mode, "sweeping", "⌁", "Пылесос")}
              ${this.quickButton(cfg.humidity, "high", "💧", "Вода")}
              ${this.quickButton(cfg.mode, "mopping_after_sweeping", "♨", "Сначала пыль, потом моп")}
              ${this.quickButton(cfg.route, "intensive", "»", "Интенсивно")}
            </div>
          </div>

          <div class="stats">
            <div class="stat"><div class="k">Выбрано</div><div class="v">${this.selectedText()}</div></div>
            <div class="stat"><div class="k">Прогресс</div><div class="v">${progress}${this.unit(cfg.progress)}</div></div>
            <div class="stat"><div class="k">Площадь</div><div class="v">${area}${this.unit(cfg.area)}</div></div>
            <div class="stat"><div class="k">Время</div><div class="v">${time}${this.unit(cfg.time)}</div></div>
          </div>

          <div class="section-title">Мощность</div>
          <div class="grid4">
            ${this.suctionTile("quiet", "Тихий", "🌀")}
            ${this.suctionTile("standard", "Стандарт", "🌀")}
            ${this.suctionTile("strong", "Сильный", "🌀")}
            ${this.suctionTile("turbo", "Турбо", "💨")}
          </div>

          <div class="section-title">Повторы и запуск</div>
          <div class="grid3">
            ${this.repeatTile("1", "x1")}
            ${this.repeatTile("2", "x2")}
            ${this.repeatTile("3", "x3")}
          </div>

          <div class="grid3">
            <div class="action primary" data-action="start-selected"><div class="ico">▶</div><div class="label">Старт</div></div>
            <div class="action danger" data-action="vacuum" data-service="stop"><div class="ico">■</div><div class="label">Стоп</div></div>
            <div class="action" data-action="vacuum" data-service="return_to_base"><div class="ico">⌂</div><div class="label">База</div></div>
          </div>

          <div class="section-title">База</div>
          <div class="grid3">
            <div class="action" data-action="press" data-entity="${cfg.autoEmptyButton}"><div class="ico">🗑</div><div class="label">Absaugen</div></div>
            <div class="action" data-action="press" data-entity="${cfg.selfCleanButton}"><div class="ico">🫧</div><div class="label">Waschen</div></div>
            <div class="action" data-action="press" data-entity="${cfg.dryingButton}"><div class="ico">♨</div><div class="label">Trocknen</div></div>
          </div>
        </div>
      </ha-card>
    `;

    this.shadowRoot.querySelectorAll("[data-action]").forEach((el) => {
      el.addEventListener("click", (ev) => {
        const target = ev.currentTarget;
        const action = target.dataset.action;
        if (action === "toggle-room") this.toggleRoom(Number.parseInt(target.dataset.roomId, 10));
        if (action === "select") this.select(target.dataset.entity, target.dataset.option);
        if (action === "press") this.press(target.dataset.entity);
        if (action === "vacuum") this.vacuum(target.dataset.service);
        if (action === "start-selected") this.startSelected();
      });
    });
  }

  zone(room) {
    const selected = this._selectedRooms.has(room.id);
    return `<polygon class="room-poly ${selected ? "selected" : ""}" data-action="toggle-room" data-room-id="${room.id}" points="${room.points}" title="${room.name}"></polygon>`;
  }

  check(room) {
    const selected = this._selectedRooms.has(room.id);
    const center = this.polygonCenter(room.points);
    return `<g class="check ${selected ? "selected" : ""}"><circle class="check-bg" cx="${center.x}" cy="${center.y}" r="4.6"></circle><text class="check-text" x="${center.x}" y="${center.y + 0.2}">✓</text></g>`;
  }

  polygonCenter(points) {
    const pairs = points.trim().split(/\s+/).map((pair) => pair.split(",").map(Number));
    const sum = pairs.reduce((acc, [x, y]) => ({ x: acc.x + x, y: acc.y + y }), { x: 0, y: 0 });
    return { x: sum.x / pairs.length, y: sum.y / pairs.length };
  }

  quickButton(entity, option, icon, title) {
    const active = this.value(entity) === option;
    return `<button class="mini ${active ? "active" : ""}" data-action="select" data-entity="${entity}" data-option="${option}" title="${title}">${icon}</button>`;
  }

  suctionTile(option, label, icon) {
    const active = this.value(this._config.suction) === option;
    return `<div class="tile ${active ? "active" : ""}" data-action="select" data-entity="${this._config.suction}" data-option="${option}"><div class="ico">${icon}</div><div class="label">${label}</div></div>`;
  }

  repeatTile(option, label) {
    const active = this.value(this._config.repeats) === option;
    return `<div class="tile ${active ? "active" : ""}" data-action="select" data-entity="${this._config.repeats}" data-option="${option}"><div class="ico">${option}</div><div class="label">${label}</div></div>`;
  }
}

customElements.define("schweinie-control-card", SchweinieControlCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "schweinie-control-card",
  name: "Schweinie Control Card",
  description: "Compact Dreame control card for Schweinie",
});
