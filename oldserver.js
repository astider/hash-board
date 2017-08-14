let a = {
  1: {
    primary_currency: 'THB',
    secondary_currency: 'btc',
    last_price: 50
  },
  2: {
    primary_currency: 'THB',
    secondary_currency: 'osa',
    last_price: 510
  },
  3: {
    primary_currency: 'THB',
    secondary_currency: 'eth',
    last_price: 5
  }
}

let newO = Object.keys(a).reduce((temp, val) => {
  if(val.primary_currency == 'THB' && val.secondary_currency == 'eth')
    return temp[val.secondary_currency] = val.last_price
}, {})

console.log(JSON.stringify(newO))