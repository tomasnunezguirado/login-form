import passport from "passport";
import local from "passport-local";
import UsersModel from "../dao/models/users.model.js";
import { createHash, isValidPassword } from "../utils/utils.js";
import { ADMIN_USER } from "../utils/adminConfig.js";

const LocalStrategy = local.Strategy;

const initializePassport = () => {
    passport.use('register', new LocalStrategy({
        usernameField: 'email',
        passReqToCallback: true,
    }, async (req, username, password, done) => {
        let errorMsg;
        try {
            const { firstName, lastName, email, birthDate } = req.body;
            if (username.toLowerCase() === ADMIN_USER.toLowerCase()) {
                errorMsg = "Flowerier already exists";
                req.flash('error', errorMsg);
                return done(null, false, { msg: errorMsg });
            }
            const exists = await UsersModel.findOne({ email: { $regex: new RegExp(`^${username}$`, 'i') } });
            if (exists) {
                errorMsg = "Flowerier already exists";
                req.flash('error', errorMsg);
                return done(null, false, { msg: errorMsg });
            }
            const newUser = {
                firstName,
                lastName,
                email: email.toLowerCase(),
                birthDate,
                password: createHash(password)
            };
            const user = await UsersModel.create(newUser);
            return done(null, user);
        } catch (error) {
            errorMsg = error.message;
            req.flash('error', errorMsg);
            return done({ msg: errorMsg });
        }
    }));

    passport.use('login', new LocalStrategy({
        usernameField: 'email',
        passReqToCallback: true,
    }, async (req, username, password, done) => {
        let errorMsg;
        try {
            let user;
            if (username.toLowerCase() === ADMIN_USER.toLowerCase()) {
                if (password !== ADMIN_PASSWORD) {
                    errorMsg = "Password is incorrect";
                    req.flash('error', errorMsg);
                    return done(null, false, { msg: errorMsg });
                }
                user = {
                    firstName: 'Admin',
                    lastName: 'Coder',
                    email: ADMIN_USER,
                    birthDate: '',
                    userRole: 'admin'
                };
            } else {
                user = await UsersModel.findOne({ email: { $regex: new RegExp(`^${username}$`, 'i') } });
                if (!user) {
                    errorMsg = "Wrong flowerier";
                    req.flash('error', errorMsg);
                    return done(null, false, { msg: errorMsg });
                }
                if (!isValidPassword(user, password)) {
                    errorMsg = "Password is incorrect";
                    req.flash('error', errorMsg);
                    return done(null, false, { msg: errorMsg });
                }
                user = { ...user.toObject(), userRole: 'user' };
                return done(null, user);
            }
        } catch (error) {
            errorMsg = error.message;
            req.flash('error', errorMsg);
            return done({ msg: errorMsg });
        }
    }));

    passport.use('resetPassword', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'newPassword',
        passReqToCallback: true,
    }, async (req, username, password, done) => {
        let errorMsg;
        try {
            if (username.toLowerCase() === ADMIN_USER.toLowerCase()) {
                errorMsg = "Admin password cannot be reset";
                req.flash('error', errorMsg);
                return done(null, false, { msg: errorMsg });
            } else {
                const user = await UsersModel.findOne({ email: { $regex: new RegExp(`^${username}$`, 'i') } });
                if (!user) {
                    errorMsg = "Wrong flowerier";
                    req.flash('error', errorMsg);
                    return done(null, false, { msg: errorMsg });
                }
                const newHashedPassword = createHash(password);
                await UsersModel.updateOne({ _id: user._id }, { $set: { password: newHashedPassword } });
                return done(null, user);
            }
        } catch (error) {
            errorMsg = "Error resetting password";
            req.flash('error', errorMsg);
            return done({ msg: errorMsg });
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (_id, done) => {
        try {
            const user = await UsersModel.findOne({ _id });
            return done(null, user);
        } catch {
            return done({ msg: "Error deserializing user" });
        }
    });

};

export default initializePassport;