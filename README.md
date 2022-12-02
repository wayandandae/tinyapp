# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Screenshot of URLs page"](https://raw.githubusercontent.com/wayandandae/tinyapp/0353efea6cbc2a6fbb88416282fed53e1e5a4447/docs/urls-page.png)
!["Screenshot of register page"](https://raw.githubusercontent.com/wayandandae/tinyapp/0353efea6cbc2a6fbb88416282fed53e1e5a4447/docs/register-page.png)
!["Screenshot of edit page"](https://raw.githubusercontent.com/wayandandae/tinyapp/0353efea6cbc2a6fbb88416282fed53e1e5a4447/docs/edit-page.png)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session
- Method-override

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Known Issues

- If the user tries to log in again after logging out, _header template is not updated.