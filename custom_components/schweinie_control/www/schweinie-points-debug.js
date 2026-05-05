(() => {
  const el = customElements.get('schweinie-control-card');
  if (!el || el.__schweiniePointsPatch) return;
  el.__schweiniePointsPatch = true;
  const original = el.prototype.setConfig;
  const rooms = [
    { id: 1, name: 'Kueche', points: '39,58 63,58 63,96 39,96' },
    { id: 2, name: 'Flur', points: '42,27 64,27 64,65 42,65' },
    { id: 3, name: 'Alisa', points: '6,62 42,62 42,92 6,92' },
    { id: 4, name: 'Julia', points: '6,33 42,33 42,62 6,62' },
    { id: 5, name: 'Badezimmer', points: '65,39 99,39 99,52 65,52' },
    { id: 6, name: 'Wohnzimmer Teppich', points: '65,68 99,68 99,96 65,96' },
    { id: 7, name: 'Schlafzimmer', points: '3,4 42,4 42,33 3,33' },
    { id: 8, name: 'Wohnzimmer', points: '65,52 99,52 99,68 65,68' }
  ];
  el.prototype.setConfig = function(config) {
    original.call(this, { ...(config || {}), rooms });
  };
})();
