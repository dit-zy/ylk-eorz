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

Set.prototype.union = function(other) {
  return new Set([...this, ...other])
}

Array.prototype.uniq = function() {
  return new Set(this)
}

Array.prototype.union = function() {
  return this.reduce((acc, next) => acc.union(next), new Set())
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
          .forEach(dr => {
            this.indexWord(dr, eo)

            if (dr.length < 3) {
              return
            }

            this.indexWord(dr.slice(1), eo)
            this.indexWord(dr.slice(0, -1), eo)
          })
      })
  }

  indexWord(dr, eo) {
    if (!(dr in this.index)) {
      this.index[dr] = new Set()
    }
    this.index[dr].add(eo)
  }

  attemptTranslate(dr) {
    const variants = [dr]
    if (3 <= dr.length) {
      variants.push(dr.slice(1), dr.slice(0, -1))
    }

    const translations = variants
      .filter(dr => dr in this.index)
      .flatMap(dr => Array.from(this.index[dr]))
      .uniq()
      .map(eo => this.words[eo])
      .union()

    return translations.size == 0 ? null : translations
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
