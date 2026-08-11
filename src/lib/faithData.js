export const TRADITIONS = [
  { id: 'christianity', label: 'Christianity', dens: ['Protestant/Evangelical', 'Catholic', 'Eastern Orthodox', 'Anglican/Episcopalian', 'Baptist', 'Lutheran', 'Methodist', 'Nondenominational'] },
  { id: 'islam', label: 'Islam', dens: ['Sunni', 'Shia', 'Sufi'] },
  { id: 'judaism', label: 'Judaism', dens: ['Orthodox', 'Conservative', 'Reform', 'Hasidic'] },
  { id: 'pagan', label: 'Pagan / Earth-Based', dens: ['Wiccan', 'Hellenic', 'Eclectic Witchcraft', 'Heathenry/Norse', 'Druidry'] },
  { id: 'eastern', label: 'Eastern / Mindfulness', dens: ['Mahayana', 'Theravada', 'Zen', 'Advaita Vedanta', 'Secular Yoga/Mindfulness'] },
  { id: 'universalist', label: 'Interfaith / Universalist & Secular', dens: ['Universalist', 'Secular Gratitude'] }
];

export const WISDOM = {
  christianity: '“The Lord is my shepherd; I shall not want. He makes me lie down in green pastures.” — Psalm 23:1',
  islam: '“With every hardship comes ease.” — Qur’an 94:6',
  judaism: '“The Lord bless you and keep you; the Lord make his face shine upon you.” — Numbers 6:24',
  pagan: '“As above, so below. The moon waxes, the moon wanes — and so do we. Tend to the cycles within you.”',
  eastern: '“Peace comes from within. Do not seek it without.” — Buddha',
  universalist: '“Gratitude turns what we have into enough. Breathe, and let that be enough today.”'
};

export const STUDY_TEMPLATES = {
  christianity: [
    { label: 'S — Scripture', key: 's' },
    { label: 'O — Observation', key: 'o' },
    { label: 'A — Application', key: 'a' },
    { label: 'P — Prayer', key: 'p' }
  ],
  islam: [
    { label: 'Ayah', key: 'ayah' },
    { label: 'Tafsir / Meaning', key: 'tafsir' },
    { label: 'Application', key: 'app' }
  ],
  judaism: [
    { label: 'Text', key: 'text' },
    { label: 'Reflection', key: 'refl' }
  ],
  pagan: [
    { label: 'Correspondence', key: 'corr' },
    { label: 'Intention', key: 'intent' },
    { label: 'Grimoire Notes', key: 'grimoire' }
  ],
  eastern: [
    { label: 'Teaching', key: 'teach' },
    { label: 'Contemplation', key: 'contemplation' }
  ],
  universalist: [
    { label: 'Quote', key: 'quote' },
    { label: 'Reflection', key: 'refl' }
  ]
};