module.exports = {
  frontend: () => {
    if (process.env.NODE_ENV === 'production')
      return 'https://app.motivatemd.com'
    else
      return 'https://app.motivatemd.com'
  },
  backend: () => {
    if (process.env.NODE_ENV === 'production')
      return 'https://api.motivatemd.com'
    else
      return 'https://api.motivatemd.com'//http://192.168.1.113:3000 http://192.168.1.88:5000 beta: http://68.183.29.23:3000
  }
}
