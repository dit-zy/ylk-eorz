Set.prototype.map = function(f) {
  return Array.from(this, f)
}

Set.prototype.join = function(sep, sorted=true) {
  const arr = Array.from(this)
  if (sorted) {
    arr.sort()
  }
  return arr.join(sep)
}

class DravinianDict {

  constructor(dictCSV) {

    this.index = {}
    this.words = {}

    this.parseDict(dictCSV)
  }

  parseDict(dictCSV) {

    dictCSV.split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        const cols = line.split(',')
        return {
          eo: cols[0],
          dr: cols[1],
        }
      })
      .forEach(e => {
        const eo = parseWord(e.eo)
          .reduce((acc, word) => {
            if (!acc) {
              if (!(word in this.words)) {
                this.words[word] = new Set([word])
              }
              return word
            } else {
              this.words[acc].add(word)
              return acc
            }
          }, '')

        parseWord(e.dr)  
          .forEach(dr => this.indexWord(dr, eo))
      })
  }

  indexWord(dr, eo) {
    if (!(dr in this.index)) {
      this.index[dr] = new Set()
    }
    this.index[dr].add(eo)
  }

  attemptTranslate(dr) {
    if (dr in this.index) {
      return this.index[dr]
        .map(eo => this.words[eo])
        .reduce((acc, alts) => {
          alts.forEach(eo => acc.add(eo))
          return acc
        }, new Set())
    }
    return null
  }
}

const parseWord = (word) => {
  return word
    .split('/')
    .map(word => word.trim().toLowerCase())
}

const parseText = (drDict, text) => {
  return text.split('\n')
    .map(line => line
      .split(' ')
      .map(dr => {
        const word = { dr: dr }
        const eo = drDict.attemptTranslate(dr)
        if (eo) {
          word.eo = eo
        }
        return word
      })
    )
}

const formatHtml = formattedText => {
  return formattedText
    .map(line => line
      .map(word => 'eo' in word
        ? { class: 'eo', text: word.eo.join('/') }
        : { class: 'dr', text: word.dr })
      .map(word => `<span class="${word.class}">${word.text}</span>`)
      .join(' ')
    )
    .join('<br />')
}
