with open('src/routes/[level]/[year]/[subject]/+page.svelte', 'r') as f:
    content = f.read()

content = content.replace("{@const generalDocsCount = getGeneralDocs().length}", "")
content = content.replace("{generalDocsCount}", "{getGeneralDocs().length}")
content = content.replace("{#if generalDocsCount > 0}", "{#if getGeneralDocs().length > 0}")

with open('src/routes/[level]/[year]/[subject]/+page.svelte', 'w') as f:
    f.write(content)
