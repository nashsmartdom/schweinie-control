(() => {
  const el = customElements.get('schweinie-control-card');
  if (!el || el.__schweiniePointsPatch) return;
  el.__schweiniePointsPatch = true;
  const original = el.prototype.setConfig;
  const rooms = [
    { id: 1, name: 'Kueche', points: '39,60 62,60 62,96 39,96' },
    { id: 2, name: 'Flur', points: '41,30 64,30 64,68 41,68' },
    { id: 3, name: 'Alisa', points: '5,62 43,62 43,92 5,92' },
    { id: 4, name: 'Julia', points: '5,35 43,35 43,62 5,62' },
    { id: 5, name: 'Badezimmer', points: '62,50 99,50 99,61 62,61' },
    { id: 6, name: 'Wohnzimmer Teppich', points: '66,75 99,75 99,96 66,96' },
    { id: 7, name: 'Schlafzimmer', points: '2,5 45,5 45,35 2,35' },
    { id: 8, name: 'Wohnzimmer', points: '66,61 99,61 99,75 66,75' }
  ];
  el.prototype.setConfig = function(config) {
    original.call(this, { ...(config || {}), rooms });
  };
})();
