"""Narration script for the research explainer.

Each LINE is one subtitle and one voice clip. Lines are grouped into scenes;
build_timeline.py voices every line, measures it and lays the scenes out
back to back, so visuals, captions and voice always stay in sync.
"""

# (scene id, narration line)
LINES = [
    ('hook', 'Accounting now runs on AI, automation, and blockchain.'),
    ('hook', 'The accountant is no longer just a record keeper, but an analyst and advisor.'),

    ('title', 'So, does learning with technology build more than technical skills?'),

    ('gap', 'Employers see a gap between the skills they need and what graduates bring.'),
    ('gap', 'Many programs still lean on theory, with limited hands-on use of digital tools.'),
    ('gap', "But past studies haven't shown how this technology actually builds competencies."),

    ('theory', "Kolb's Experiential Learning says we learn best by doing."),
    ('theory', "Siemens' Connectivism says knowledge grows through digital networks."),
    ('theory', "And Bandura's Social Cognitive Theory says we learn by observing others."),

    ('ipo', 'Input: the respondents, and the competencies they need.'),
    ('ipo', 'Process: how technology-integrated education shaped them.'),
    ('ipo', 'Output: evidence-based strategies and policy recommendations.'),

    ('comp', 'We focus on five competencies from the International Education Standards:'),
    ('comp', 'intellectual, technical, personal, interpersonal, and organizational skills.'),
    ('hypo', 'Our null hypothesis: technology-integrated education has no significant relationship with these competencies.'),

    ('design', 'We use a mixed-methods, nested design: a survey measures the relationship, and interviews explain why.'),
    ('sample', "From one hundred twelve newly passed CPAs from PLV, Slovin's formula sets at least eighty-eight respondents."),
    ('sample', 'All passed the board exam from 2023 to 2025, and work in accounting.'),
    ('survey', 'They rate each statement on a four-point Likert scale, and ten join in-depth interviews.'),
    ('analysis', 'Weighted means describe their answers, correlation tests the relationship, and thematic analysis finds common themes.'),
    ('ethics', 'Participation is voluntary, and all data is protected under the Data Privacy Act.'),

    ('impact', 'This study will help CPAs, students, educators, and PLV build an accounting education that keeps pace with technology.'),
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
    "From one hundred twelve newly passed CPAs from PLV, Slovin's formula sets at least eighty-eight respondents.":
        "From 112 newly passed CPAs from PLV, Slovin's formula sets at least 88 respondents.",
}
