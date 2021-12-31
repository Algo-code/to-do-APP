module.exports = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        console.log('isAuth reached');
        return res.redirect('/login');
    }
    next();
}