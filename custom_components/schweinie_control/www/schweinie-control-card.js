class SchweinieControlCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._mapUrl = null;
    this._lastMapToken = null;
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
      selected: "sensor.schweinie_control_selected_rooms",
      cleanButton: "button.schweinie_control_clean_selected",
      resetButton: "button.schweinie_control_reset_selection",
      autoEmptyButton: "button.schweinie_start_auto_empty",
      selfCleanButton: "button.schweinie_self_clean",
      dryingButton: "button.schweinie_manual_drying",
      rooms: [
        { id: 1, name: "Küche", entity: "switch.schweinie_room_kueche" },
        { id: 2, name: "Flur", entity: "switch.schweinie_room_flur" },
        { id: 3, name: "Alisa", entity: "switch.schweinie_room_alisa" },
        { id: 4, name: "Julia", entity: "switch.schweinie_room_julia" },
        { id: 5, name: "Bad", entity: "switch.schweinie_room_badezimmer" },
        { id: 6, name: "Teppich", entity: "switch.schweinie_room_wohnzimmer_teppich" },
        { id: 7, name: "Schlaf", entity: "switch.schweinie_room_schlafzimmer" },
        { id: 8, name: "Wohn", entity: "switch.schweinie_room_wohnzimmer" },
      ],
      ...config,
    };
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  getCardSize() {
    return 9;
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

  toggle(entity) {
    this.callService("switch", "toggle", { entity_id: entity });
  }

  press(entity) {
    this.callService("button", "press", { entity_id: entity });
  }

  vacuum(service) {
    this.callService("vacuum", service, { entity_id: this._config.vacuum });
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
    const selected = this.value(cfg.selected, "Keine");
    const mapUrl = this.getMapUrl();

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        ha-card {
          border-radius: 24px;
          overflow: hidden;
          background: #101010;
          color: var(--primary-text-color);
          box-shadow: var(--ha-card-box-shadow, none);
        }
        .wrap { padding: 14px; display: grid; gap: 12px; }
        .headline {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          align-items: center;
          padding: 4px 2px 0;
        }
        .title { font-size: 22px; font-weight: 750; letter-spacing: -.02em; }
        .sub { color: var(--secondary-text-color); font-size: 13px; margin-top: 3px; }
        .pill {
          border-radius: 999px;
          background: rgba(255,255,255,.08);
          padding: 8px 12px;
          font-weight: 700;
          font-size: 13px;
        }
        .map {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          background: #050505;
          border: 1px solid rgba(255,255,255,.08);
        }
        .map img {
          display: block;
          width: 100%;
          height: auto;
          min-height: 260px;
          background: #050505;
        }
        .floating {
          position: absolute;
          top: 12px;
          right: 12px;
          display: grid;
          grid-template-columns: repeat(2, 48px);
          gap: 8px;
        }
        .mini {
          height: 48px;
          border: 1px solid rgba(255,255,255,.14);
          border-radius: 17px;
          background: rgba(0,0,0,.76);
          color: white;
          font-size: 22px;
          cursor: pointer;
          backdrop-filter: blur(8px);
          box-shadow: 0 8px 24px rgba(0,0,0,.28);
        }
        .mini.active {
          color: #29a9ff;
          border-color: rgba(41,169,255,.58);
          background: rgba(41,169,255,.18);
        }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .stat, .tile, .action {
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(255,255,255,.045);
          border-radius: 18px;
          min-height: 62px;
          padding: 12px;
        }
        .stat .k { color: var(--secondary-text-color); font-size: 12px; }
        .stat .v { font-size: 18px; font-weight: 750; margin-top: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .grid2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        .grid3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
        .grid4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
        .rooms { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
        .tile, .action, .roomBtn {
          display: grid;
          place-items: center;
          text-align: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }
        .roomBtn {
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(255,255,255,.045);
          border-radius: 16px;
          min-height: 58px;
          padding: 10px 6px;
          font-weight: 760;
          font-size: 13px;
        }
        .roomBtn .id {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,.12);
          color: var(--secondary-text-color);
          font-size: 12px;
        }
        .roomBtn.active {
          border-color: rgba(41,169,255,.58);
          background: rgba(41,169,255,.14);
          color: #29a9ff;
        }
        .roomBtn.active .id { background: #29a9ff; color: #000; }
        .tile .ico, .action .ico { font-size: 28px; line-height: 1; }
        .tile .label, .action .label { font-size: 15px; font-weight: 720; }
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
          .stats { grid-template-columns: repeat(2, 1fr); }
          .grid4 { grid-template-columns: repeat(2, 1fr); }
          .rooms { grid-template-columns: repeat(2, 1fr); }
          .grid3 { grid-template-columns: repeat(3, 1fr); }
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
            <div class="floating">
              ${this.quickButton(cfg.mode, "sweeping", "⌁", "Пылесос")}
              ${this.quickButton(cfg.humidity, "high", "💧", "Вода")}
              ${this.quickButton(cfg.mode, "mopping_after_sweeping", "♨", "Сначала пыль, потом моп")}
              ${this.quickButton(cfg.route, "intensive", "»", "Интенсивно")}
            </div>
          </div>

          <div class="stats">
            <div class="stat"><div class="k">Выбрано</div><div class="v">${selected}</div></div>
            <div class="stat"><div class="k">Прогресс</div><div class="v">${progress}${this.unit(cfg.progress)}</div></div>
            <div class="stat"><div class="k">Площадь</div><div class="v">${area}${this.unit(cfg.area)}</div></div>
            <div class="stat"><div class="k">Время</div><div class="v">${time}${this.unit(cfg.time)}</div></div>
          </div>

          <div class="section-title">Комнаты</div>
          <div class="rooms">
            ${cfg.rooms.map(room => this.roomButton(room)).join("")}
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
            <div class="action primary" data-action="press" data-entity="${cfg.cleanButton}"><div class="ico">▶</div><div class="label">Старт</div></div>
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
        if (action === "toggle-room") this.toggle(target.dataset.entity);
        if (action === "select") this.select(target.dataset.entity, target.dataset.option);
        if (action === "press") this.press(target.dataset.entity);
        if (action === "vacuum") this.vacuum(target.dataset.service);
      });
    });
  }

  quickButton(entity, option, icon, title) {
    const active = this.value(entity) === option;
    return `<button class="mini ${active ? "active" : ""}" data-action="select" data-entity="${entity}" data-option="${option}" title="${title}">${icon}</button>`;
  }

  roomButton(room) {
    const active = this.value(room.entity) === "on";
    return `<div class="roomBtn ${active ? "active" : ""}" data-action="toggle-room" data-entity="${room.entity}"><div class="id">${room.id}</div><div>${room.name}</div></div>`;
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
