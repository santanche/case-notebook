(function() {
Translator.htmlTemplates = {
option:
`<dcc-trigger link='[link].html' label='[display]' [image]></dcc-trigger>`,
divert:
`<dcc-link link='[link].html' label='[target]'></dcc-link>`,
talk:
`<dcc-lively-talk character='[character]' speech='[speech]'>
</dcc-lively-talk>`,
input:
`<[input-type] [input-parameters] class='userInput' id='[variable]'
   oninput="followInput('[variable]','[vocabulary]')">
</[input-type]>
<span id='[variable]_result'></span>`,
domain:
`[natural]`,
selctxopen:
`

<dcc-group-selector evaluation='[evaluation]'[states][colors]>

`,
selctxclose:
`

</dcc-group-selector>

`,
selector:
`<dcc-state-selector>[expression]</dcc-state-selector>`
};
})();