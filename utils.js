const parseDict = dictCSV => {
  return dictCSV.split('\n')
    .filter(line => line.trim() !== '')
    .map(line => {
      const cols = line.split(',')
      return {
        eo: cols[0],
        dr: cols[1],
      }
    })
    .reduce((acc, e) => {
      const eo = e.eo.toLowerCase()
      const dr = e.dr.toLowerCase()

      if (!(eo in acc.eo)) {
        acc.eo[eo] = []
      }
      acc.eo[eo].push(dr)

      if (!(dr in acc.dr)) {
        acc.dr[dr] = []
      }
      acc.dr[dr].push(eo)

      return acc
    }, { eo: {}, dr: {} })
}

const parseText = (trDict, text) => {
  return text.split('\n')
    .map(line => line
      .split(' ')
      .map(word => ({ dr: word }))
      .map(word => {
        if (word.dr in trDict.dr) {
          word.eo = trDict.dr[word.dr]
        }
        return word
      })
    )
}

const formatHtml = formattedText => {
  return formattedText
    .map(line => line
      .map(word => 'eo' in word
        ? { class: 'eo', text: word.eo }
        : { class: 'dr', text: word.dr })
      .map(word => `<span class="${word.class}">${word.text}</span>`)
      .join(' ')
    )
    .join('<br />')
}
