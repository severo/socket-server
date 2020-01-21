import Joi from '@hapi/joi'
import nanoid from 'nanoid'
import rnd from 'randomcolor'

// Validation
// TODO: remove, or merge, with src/shared/validation?
const nameSchema = Joi.string().min(1)
const colorSchema = Joi.string().pattern(
  new RegExp('^#(?:[0-9a-fA-F]{3}){1,2}$')
)
const checkName = (name: string) => {
  const validation = nameSchema.validate(name)
  if (validation.error !== undefined) {
    throw validation.error
  }
  return name
}
const checkColor = (color: string) => {
  const validation = colorSchema.validate(color)
  if (validation.error !== undefined) {
    throw validation.error
  }
  return color
}
// Defaults
const randomName = () => checkName(nanoid(5))
const randomColor = () => checkColor(rnd({ luminosity: 'dark' }))
const MS_UNTIL_EXPIRATION: number = 10 * 60 * 1000

export class User {
  private _socketId: SocketIOClient.Socket['id']
  private _name: string
  private _color: string
  private _updated_at: Date
  private _expired_at: Date
  private _msUntilExpiration: number

  constructor(
    socketId: SocketIOClient.Socket['id'],
    { msUntilExpiration = MS_UNTIL_EXPIRATION } = {
      msUntilExpiration: MS_UNTIL_EXPIRATION,
    }
  ) {
    this._socketId = socketId
    this._msUntilExpiration = msUntilExpiration
    this._name = randomName()
    this._color = randomColor()
    this.touch()
  }

  get id() {
    return this._socketId
  }

  get name(): string {
    return this._name
  }
  set name(name: string) {
    this._name = checkName(name)
  }

  get color(): string {
    return this._color
  }
  set color(color: string) {
    this._color = checkColor(color)
  }

  touch() {
    this._updated_at = new Date()
    this._expired_at = new Date(
      this._updated_at.getTime() + this._msUntilExpiration
    )
    return this
  }

  hasExpiredAt(date: Date) {
    return this._expired_at < date
  }
}
