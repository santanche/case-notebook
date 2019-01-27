(function() {
Translator.htmlTemplates = {
option:
`<dcc-trigger link='[link].html' label='[display]' [image]></dcc-trigger>`,
divert:
`<dcc-link link='[link].html' label='[target]'></dcc-link>`,
input:
`<[input-type] [input-parameters] class='userInput' id='[variable]'
   oninput="followInput('[variable]','[vocabulary]')">
</[input-type]>
<span id='[variable]_result'></span>`
}
})();