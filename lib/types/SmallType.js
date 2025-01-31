'use strict'

var Type = require('./Type.js')
  , Expression = require('../expressions/Expression.js')

function SmallType(name, wrappedType) {
  this.name = name
  this.wrappedType = wrappedType
  this.validateType(this.wrappedType)
  Object.defineProperty(this, 'convertFrom', {
    get: function() {
      var expr = new Expression(this.wrappedType + ' to ' + this.name)
      expr.takes(this, '@this')
      expr.returns(this.wrappedType)
      expr.as('@this')
      return expr
    }
  })
  Object.defineProperty(this, 'convertTo', {
    get: function() {
      var expr = new Expression(this.name + ' to ' + this.wrappedType)
      expr.takes(this.wrappedType, '@wrappedType')
      expr.returns(this)
      expr.as('@wrappedType')
      return expr
    }
  })
}
SmallType.prototype = Object.create(Type.prototype)
SmallType.prototype.constructor = Type

SmallType.prototype.getDefault = function() {
  return this.wrappedType.getDefault()
}

SmallType.prototype.hasTypeParameter = function() {
  return this.wrappedType.hasTypeParameter()
}

SmallType.prototype.getChildTypes = function() {
  return [this.wrappedType]
}

SmallType.prototype.resolveType = function(resolved) {
  var result = Object.create(SmallType.prototype)
  resolved.push({ unresolved: this, resolved: result })
  SmallType.call(result, this.name, this.wrappedType.resolveTypeFrom(resolved))
  return result
}

SmallType.prototype.isSmallTypeFor = function(type) { 
  return this.wrappedType.equals(type)
}

SmallType.prototype.tryFilterType = function(typeFilters, recs) {
  if(!typeFilters || !Object.keys(typeFilters).length) return this
  recs = recs || []
  var wrapped = this.wrappedType.tryFilterType(typeFilters, recs)
  if(!wrapped) return null
  var result = new SmallType(this.name, wrapped)
  return result
}

SmallType.prototype.containsType = function(instance, typeFilters, recs) {
  recs = recs || []
  if(instance instanceof SmallType)
    return this.name == instance.name &&
      this.wrappedType.containsType(instance.wrappedType, typeFilters, recs)
  return null
}

SmallType.prototype.canonicalize = function(recordTypesBySignature) {
  return new SmallType(
    this.name,
    this.wrappedType.canonicalize(recordTypesBySignature))
}

SmallType.prototype.unwrapSmallTypes = function(resolved) {
  return this.wrappedType
}

Object.defineProperty(SmallType.prototype, 'habitationTemplate', {
  get: function() { return this.wrappedType.habitationTemplate },
  enumerable: true
})

module.exports = SmallType
