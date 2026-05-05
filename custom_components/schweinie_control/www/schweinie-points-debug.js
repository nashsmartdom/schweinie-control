(() => {
  const el = customElements.get('schweinie-control-card');
  if (!el || el.__schweiniePointsPatch) return;
  el.__schweiniePointsPatch = true;
  const original = el.prototype.setConfig;
  const rooms = [
    { id: 1, name: 'Kueche', points: '43,59 58,59 58,68 63,68 63,91 53,91 53,84 42,84 42,77 38,77 38,66 43,66' },
    { id: 2, name: 'Flur', points: '39,25 56,25 56,32 62,32 62,42 68,42 68,62 59,62 59,69 43,69 43,58 37,58 37,47 33,47 33,39 39,39' },
    { id: 3, name: 'Alisa', points: '7,60 29,60 29,67 37,67 37,92 19,92 19,85 7,85' },
    { id: 4, name: 'Julia', points: '6,35 22,35 22,41 36,41 36,51 43,51 43,61 33,61 33,65 6,65 6,49 3,49 3,39 6,39' },
    { id: 5, name: 'Badezimmer', points: '62,39 99,39 99,52 66,52 66,48 58,48 58,43 62,43' },
    { id: 6, name: 'Wohnzimmer Teppich', points: '66,66 99,66 99,92 66,92' },
    { id: 7, name: 'Schlafzimmer', points: '4,4 42,4 42,24 39,24 39,31 16,31 16,26 4,26 4,17 1,17 1,7 4,7' },
    { id: 8, name: 'Wohnzimmer', points: '60,51 99,51 99,68 60,68' }
  ];
  el.prototype.setConfig = function(config) {
    original.call(this, { ...(config || {}), rooms });
  };
})();
