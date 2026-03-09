#set document(title: "دليل منصة أفدنا التعليمية", author: "فريق أفدنا")
#set text(lang: "ar", dir: rtl, size: 14pt)
#set page(paper: "a4", numbering: "1")
#set heading(numbering: "1.1.")
#set par(justify: true, leading: 1.5em)

#align(center)[
  #v(4cm)
  #text(size: 32pt, weight: "bold", fill: rgb("#065f46"))[دليل منصة أفدنا التعليمية]
  
  #v(1cm)
  #text(size: 20pt)[الرؤية، التقنيات، والمستقبل]
  
  #v(3cm)
  #text(size: 14pt, fill: luma(100))[(الإصدار المطور - 2026)]
]

#pagebreak()

#outline(title: "الفهرس", depth: 3, indent: 1.5em)

#pagebreak()

#include "chapters/01-introduction.typ"
#include "chapters/02-pedagogical-strategy.typ"
#include "chapters/03-features.typ"
#include "chapters/04-tech-and-development.typ"
#include "chapters/05-future-roadmap.typ"
