"""Narration script for the research explainer.

Each LINE is one subtitle and one voice clip. Lines are grouped into scenes;
build_timeline.py voices every line, measures it and lays the scenes out
back to back, so visuals, captions and voice always stay in sync.
"""

# (scene id, narration line)
LINES = [
    ('hook', 'Accounting now runs on AI, automation, and blockchain, turning record keepers into analysts and advisors.'),

    ('title', 'So, does learning with technology build more than technical skills?'),

    ('gap', 'Employers see a gap between the skills they need and what graduates bring.'),
    ('gap', "Programs lean on theory with little hands-on practice, and past studies haven't shown how technology builds competencies."),

    ('theory', 'Kolb says we learn by doing, Siemens through digital networks, and Bandura by observing others.'),

    ('ipo', 'An Input, Process, Output model links respondents and competencies to recommendations.'),

    ('comp', 'We measured five competencies: intellectual, technical, personal, interpersonal, and organizational.'),
    ('hypo', 'Our null hypothesis: there is no significant relationship.'),

    ('design', 'In a mixed-methods design, a survey measured the relationship, and interviews explained why.'),
    ('sample', "From one hundred twelve newly passed CPAs from PLV, Slovin's formula set a sample of eighty-eight."),
    ('survey', 'They rated each statement on a four-point Likert scale, and eight joined in-depth interviews.'),
    ('analysis', 'We used weighted means, Pearson correlation, and thematic analysis.'),
    ('ethics', 'Participation was voluntary, and data stays protected by law.'),

    ('profile', 'So, what did we find? Eighty-eight newly passed CPAs answered the survey.'),
    ('profile', 'Almost all are employed, most in private or corporate accounting, with two years of experience or less.'),

    ('skills', 'All five competencies scored high, on a scale of one to four.'),
    ('skills', 'Intellectual skills ranked highest, at three point three one, led by finding information from digital resources.'),
    ('skills', 'Technical, personal, and organizational scored three point two six; interpersonal, three point zero nine.'),

    ('exposure', 'Exposure to technology was rated positive overall, at three point zero zero,'),
    ('exposure', 'but hands-on accounting software and collaborative tools scored the lowest.'),

    ('corr', 'Pearson correlation found a strong, significant relationship: r equals point six seven, p less than point zero zero one.'),
    ('corr', 'So the null hypothesis is rejected. About forty-four percent of the variance is shared,'),
    ('corr', 'though this shows an association, not proof of cause.'),

    ('voices', 'The interviews explained why: technology made studying faster and more independent,'),
    ('voices', 'and internships showed how classroom tools work in real accounting jobs.'),

    ('recs', 'We recommend that students explore digital tools beyond the classroom,'),
    ('recs', 'educators use spreadsheets, simulations, and case-based activities,'),
    ('recs', 'and PLV invest in accounting software, computer labs, and faculty training.'),

    ('outro', 'Because the accountant of the future needs more than technical skills.'),
]

TITLE = 'Beyond Technical Skills'
SUBTITLE = ('Perceived Effects of Technology-Integrated Accounting Education on the Development of '
            'Multidimensional Competencies among Newly Passed Certified Public Accountants '
            'from Pamantasan ng Lungsod ng Valenzuela')
AUTHORS = ['Adversario, Althea Faith U.', 'Campo, Gillian Joy G.', 'Dumigpe, Risca M.',
           'Larioque, Angelique Pauline R.', 'Orbase, James Renmar M.', 'Silencio, Mikhaella J.']

# Subtitle text where it should differ from what the narrator reads aloud
CAPTIONS = {
    "From one hundred twelve newly passed CPAs from PLV, Slovin's formula set a sample of eighty-eight.":
        "From 112 newly passed CPAs from PLV, Slovin's formula set a sample of 88.",
    'So, what did we find? Eighty-eight newly passed CPAs answered the survey.':
        'So, what did we find? 88 newly passed CPAs answered the survey.',
    'All five competencies scored high, on a scale of one to four.':
        'All five competencies scored high, on a scale of 1 to 4.',
    'Intellectual skills ranked highest, at three point three one, led by finding information from digital resources.':
        'Intellectual skills ranked highest, at 3.31, led by finding information from digital resources.',
    'Technical, personal, and organizational scored three point two six; interpersonal, three point zero nine.':
        'Technical, personal, and organizational scored 3.26; interpersonal, 3.09 (lowest).',
    'Exposure to technology was rated positive overall, at three point zero zero,':
        'Exposure to technology was rated positive overall, at 3.00,',
    'Pearson correlation found a strong, significant relationship: r equals point six seven, p less than point zero zero one.':
        'Pearson correlation found a strong, significant relationship: r = .67, p < .001.',
    'So the null hypothesis is rejected. About forty-four percent of the variance is shared,':
        'So the null hypothesis is rejected. About 44% of the variance is shared (r² = .44),',
}
