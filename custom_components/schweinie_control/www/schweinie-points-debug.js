(() => {
  const el = customElements.get('schweinie-control-card');
  if (!el || el.__schweiniePointsPatch) return;
  el.__schweiniePointsPatch = true;
  const original = el.prototype.setConfig;
  const rooms = [
    { id: 1, name: 'Kueche', points: '40,57 61,57 61,96 40,96' },
    { id: 2, name: 'Flur', points: '41,28 64,28 64,66 41,66' },
    { id: 3, name: 'Alisa', points: '5,61 43,61 43,92 5,92' },
    { id: 4, name: 'Julia', points: '5,34 43,34 43,61 5,61' },
    { id: 5, name: 'Badezimmer', points: '64,45 99,45 99,58 64,58' },
    { id: 6, name: 'Wohnzimmer Teppich', points: '64,72 99,72 99,96 64,96' },
    { id: 7, name: 'Schlafzimmer', points: '2,4 45,4 45,34 2,34' },
    { id: 8, name: 'Wohnzimmer', points: '64,58 99,58 99,72 64,72' }
  ];
  el.prototype.setConfig = function(config) {
    original.call(this, { ...(config || {}), rooms });
  };
})();
