import EventEmitter from "events"
import MuteStream from "mute-stream"
import { fromEvent } from "rxjs"
import ansiEscapes from "ansi-escapes"
import rl from "readline"

const options = {
  type: 'list',
  name: 'name',
  message: 'select your name',
  choices: [
    {
      name: 'a',
      value: 1,
    },
    {
      name: 'b',
      value: 2,
    },
    {
      name: 'c',
      value: 3,
    },
  ]
}


function Prompt(option) {
  return new Promise((resolve, reject) => {
    try {
      const list = new List(option)
      list.render()
      list.on("exit", answer => {
        console.log(answer);
        resolve(answer)
      })
    } catch (error) {
      reject(error)
    }
  })
}

class List extends EventEmitter {
  constructor(option) {
    super()
    this.name = option.name
    this.message = option.message
    this.choices = option.choices
    this.input = process.stdin
    const ms = new MuteStream()
    ms.pipe(process.stdout)
    this.output = ms
    this.rl = rl.createInterface({
      input: this.input,
      output: this.output,
    })
    this.selected = 0
    this.keypress = fromEvent(this.rl.input, "keypress")
      .forEach(this.onKeyPress)
    this.hasSelected = false
  }
  onKeyPress = (e) => {
    const key = e[1]
    switch (key.name) {
      case "down":
        this.selected++
        break;
      case "up":
        this.selected--
        break;
      case "return":
        this.hasSelected = true
        this.render()
        this.close()
        this.emit("exit", this.choices[this.selected])
        return
      default:
        break;
    }
    if (this.selected > this.choices.length - 1) {
      this.selected = 0
    }
    if (this.selected < 0) {
      this.selected = this.choices.length - 1
    }
    this.render()
  }
  close() {

  }
  getContent() {
    let title = this.message + '(Use arrow keys)\n'
    if (!this.hasSelected) {
      this.choices.forEach((choice, index) => {
        if (index === this.selected) {
          if (index === this.selected.length - 1) {
            title += '> ' + choice.name
          } else {
            title += '> ' + choice.name + '\n'
          }
        } else {
          if (index === this.selected.length - 1) {
            title += '  ' + choice.name
          } else {
            title += '  ' + choice.name + '\n'
          }
        }
      })
    } else {

    }
    return title
  }
  clean() {
    const emptyLines = ansiEscapes.eraseLines(this.choices.length + 1)
    this.output.write(emptyLines)
  }
  render() {
    this.output.unmute()
    this.clean()
    this.output.write(this.getContent())
    this.output.mute()
  }
}

Prompt(options).then(res => {
  console.log(res);
})