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

export const RECORD_TEMPLATES = {
  christianity: [
    { label: 'Parish / Church', key: 'church' },
    { label: 'Baptism date', key: 'baptism_date' },
    { label: 'Baptism location', key: 'baptism_location' },
    { label: 'Godparents', key: 'godparents' },
    { label: 'Godparent contacts', key: 'godparent_contacts' },
    { label: 'Confirmation date', key: 'confirmation_date' },
    { label: 'Confirmation sponsor', key: 'sponsor' },
    { label: 'First Communion', key: 'communion' },
    { label: 'Clergy contact', key: 'clergy' }
  ],
  islam: [
    { label: 'Mosque / Community', key: 'mosque' },
    { label: 'Shahada date', key: 'shahada' },
    { label: 'Imam / Sheikh contact', key: 'imam' },
    { label: 'Madrasah / Teacher', key: 'teacher' },
    { label: 'Marriage (Nikah) details', key: 'nikah' },
    { label: 'Hajj / Umrah year', key: 'hajj' }
  ],
  judaism: [
    { label: 'Synagogue / Temple', key: 'synagogue' },
    { label: 'Hebrew name', key: 'hebrew_name' },
    { label: 'Bar/Bat Mitzvah date', key: 'mitzvah' },
    { label: 'Rabbi contact', key: 'rabbi' },
    { label: 'Ketubah details', key: 'ketubah' },
    { label: 'Yeshiva / School', key: 'yeshiva' }
  ],
  pagan: [
    { label: 'Coven / Circle', key: 'coven' },
    { label: 'Tradition / Path', key: 'path' },
    { label: 'Dedication / Initiation date', key: 'initiation' },
    { label: 'Teacher / Mentor', key: 'mentor' },
    { label: 'Patron deities', key: 'deities' },
    { label: 'Altar / Sacred space', key: 'altar' }
  ],
  eastern: [
    { label: 'Temple / Sangha', key: 'sangha' },
    { label: 'Refuge name / date', key: 'refuge' },
    { label: 'Teacher (Roshi / Guru)', key: 'teacher' },
    { label: 'Precepts taken', key: 'precepts' },
    { label: 'Lineage', key: 'lineage' },
    { label: 'Meditation practice', key: 'practice' }
  ],
  universalist: [
    { label: 'Community / Group', key: 'community' },
    { label: 'Joined date', key: 'joined' },
    { label: 'Mentor / Anchor', key: 'mentor' },
    { label: 'Core values', key: 'values' },
    { label: 'Personal affirmation', key: 'affirmation' }
  ]
};

export const EXAMEN_TEMPLATES = {
  christianity: [
    'Where did I notice God\'s presence today?',
    'When did I turn away from love or truth?',
    'Examine my thoughts, words, deeds, and omissions.',
    'Whom did I fail to love as myself?',
    'What grace do I ask for tomorrow?'
  ],
  islam: [
    'Did I perform my prayers with presence?',
    'Was I honest in word and trade?',
    'Did I guard my tongue from gossip and harm?',
    'Did I give charity and care for others?',
    'What can I do better tomorrow, insha\'Allah?'
  ],
  judaism: [
    'Did I act justly today?',
    'Did I love mercy and kindness?',
    'Did I walk humbly before God?',
    'Which mitzvot did I keep or neglect?',
    'How will I repair what I missed?'
  ],
  pagan: [
    'Did I honor the cycles of the earth?',
    'Did I act in harmony with nature and others?',
    'Did I harm none — in thought, word, or deed?',
    'Did I tend to my own inner seasons?',
    'What do I release, and what do I call in?'
  ],
  eastern: [
    'Was I present, or lost in thought?',
    'Did I act with compassion and non-harm?',
    'Where did attachment or aversion arise?',
    'Did I speak truthfully and kindly?',
    'What will I practice tomorrow?'
  ],
  universalist: [
    'What am I grateful for today?',
    'Where did I show or receive kindness?',
    'What weighed on my heart that I can release?',
    'How did I honor my values?',
    'What is my intention for tomorrow?'
  ]
};

export const LITURGICAL = {
  christianity: [
    { name: 'Advent', when: 'Late Nov–Dec', desc: 'Preparation for Christmas.' },
    { name: 'Christmas', when: 'Dec 25', desc: 'Birth of Christ.' },
    { name: 'Epiphany', when: 'Jan 6', desc: 'Visit of the Magi.' },
    { name: 'Lent', when: 'Feb–Mar (40 days)', desc: 'Penitential season before Easter.' },
    { name: 'Holy Week', when: 'Palm Sunday–Easter', desc: 'Passion of Christ.' },
    { name: 'Easter', when: 'Mar/Apr', desc: 'Resurrection.' },
    { name: 'Pentecost', when: '50 days after Easter', desc: 'Descent of the Holy Spirit.' },
    { name: 'Ordinary Time', when: 'Summer–Fall', desc: 'Growth and discipleship.' }
  ],
  islam: [
    { name: 'Muharram (New Year)', when: '1st month', desc: 'Islamic New Year.' },
    { name: 'Ramadan', when: '9th month', desc: 'Month of fasting.' },
    { name: 'Eid al-Fitr', when: 'End of Ramadan', desc: 'Festival of breaking the fast.' },
    { name: 'Day of Arafah', when: '9 Dhul-Hijjah', desc: 'Day of pilgrimage.' },
    { name: 'Eid al-Adha', when: '10 Dhul-Hijjah', desc: 'Festival of sacrifice.' },
    { name: 'Ashura', when: '10 Muharram', desc: 'Day of significance, esp. for Shia.' },
    { name: 'Mawlid', when: '12 Rabi al-Awwal', desc: 'Birth of the Prophet.' }
  ],
  judaism: [
    { name: 'Rosh Hashanah', when: 'Tishrei 1–2', desc: 'Jewish New Year.' },
    { name: 'Yom Kippur', when: 'Tishrei 10', desc: 'Day of Atonement.' },
    { name: 'Sukkot', when: 'Tishrei 15–21', desc: 'Festival of booths.' },
    { name: 'Hanukkah', when: 'Kislev 25', desc: 'Festival of lights.' },
    { name: 'Tu BiShvat', when: 'Shevat 15', desc: 'New year of trees.' },
    { name: 'Purim', when: 'Adar 14', desc: 'Festival from Esther.' },
    { name: 'Pesach (Passover)', when: 'Nisan 15', desc: 'Exodus from Egypt.' },
    { name: 'Shavuot', when: 'Sivan 6', desc: 'Giving of the Torah.' }
  ],
  pagan: [
    { name: 'Samhain', when: 'Oct 31', desc: 'New year; honoring ancestors.' },
    { name: 'Yule (Winter Solstice)', when: 'Dec 21', desc: 'Return of the light.' },
    { name: 'Imbolc', when: 'Feb 1', desc: 'First signs of spring.' },
    { name: 'Ostara (Spring Equinox)', when: 'Mar 20', desc: 'Fertility and renewal.' },
    { name: 'Beltane', when: 'May 1', desc: 'Fire festival of summer.' },
    { name: 'Litha (Summer Solstice)', when: 'Jun 21', desc: 'Longest day.' },
    { name: 'Lughnasadh', when: 'Aug 1', desc: 'First harvest.' },
    { name: 'Mabon (Autumn Equinox)', when: 'Sep 22', desc: 'Second harvest.' }
  ],
  eastern: [
    { name: 'Losar', when: 'Feb (Tibetan New Year)', desc: 'Tibetan/Vajrayana new year.' },
    { name: 'Vesak', when: 'May (full moon)', desc: 'Birth, enlightenment, parinirvana of Buddha.' },
    { name: 'Vassa (Rains Retreat)', when: 'Jul–Oct', desc: 'Theravada monastic retreat.' },
    { name: 'Kathina', when: 'End of Vassa', desc: 'Robe-offering festival.' },
    { name: 'Obon', when: 'Aug (Zen/Japan)', desc: 'Honoring ancestors.' },
    { name: 'Magha Puja', when: 'Feb full moon', desc: 'Commemoration of the Sangha.' }
  ],
  universalist: [
    { name: 'New Year Reflection', when: 'Jan 1', desc: 'Setting intentions.' },
    { name: 'Spring Equinox', when: 'Mar 20', desc: 'Renewal and balance.' },
    { name: 'Summer Solstice', when: 'Jun 21', desc: 'Light and gratitude.' },
    { name: 'Autumn Equinox', when: 'Sep 22', desc: 'Harvest and release.' },
    { name: 'Winter Solstice', when: 'Dec 21', desc: 'Rest and reflection.' },
    { name: 'Gratitude Day', when: 'Any day', desc: 'A chosen day of thanks.' }
  ]
};