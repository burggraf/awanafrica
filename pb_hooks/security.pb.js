
routerAdd("GET", "/*", (e) => {
    e.next()
    e.response.header().set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
    e.response.header().set("X-Content-Type-Options", "nosniff")
    e.response.header().set("X-Frame-Options", "SAMEORIGIN")
    e.response.header().set("X-XSS-Protection", "1; mode=block")
})
