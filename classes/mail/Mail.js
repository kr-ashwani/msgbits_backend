"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Mail = /** @class */ (function () {
    function Mail(mail) {
        this.from = (mail === null || mail === void 0 ? void 0 : mail.from) || "";
        this.to = (mail === null || mail === void 0 ? void 0 : mail.to) || "";
        this.cc = (mail === null || mail === void 0 ? void 0 : mail.cc) || "";
        this.bcc = (mail === null || mail === void 0 ? void 0 : mail.bcc) || "";
        this.subject = (mail === null || mail === void 0 ? void 0 : mail.subject) || "";
        this.mailSalutation = (mail === null || mail === void 0 ? void 0 : mail.mailSalutation) || "";
        this.body = (mail === null || mail === void 0 ? void 0 : mail.body) || "";
        this.mailSignature = (mail === null || mail === void 0 ? void 0 : mail.mailSignature) || "";
        this.mainBody = (mail === null || mail === void 0 ? void 0 : mail.mainBody) || "";
    }
    Mail.prototype.setFrom = function (from) {
        this.from = from;
    };
    Mail.prototype.setTo = function (to) {
        this.to = to;
    };
    Mail.prototype.setCc = function (cc) {
        this.cc = cc;
    };
    Mail.prototype.setBcc = function (bcc) {
        this.bcc = bcc;
    };
    Mail.prototype.setSubject = function (subject) {
        this.subject = subject;
    };
    Mail.prototype.setMailSalutation = function (mailSalutation) {
        this.mailSalutation = mailSalutation;
    };
    Mail.prototype.setBody = function (Body) {
        this.body = this.body;
    };
    Mail.prototype.setMailSignature = function (mailSignature) {
        this.mailSignature = mailSignature;
    };
    Mail.prototype.setMainBody = function (mainBody) {
        this.mainBody = mainBody;
    };
    Mail.prototype.getFrom = function () {
        return this.from;
    };
    Mail.prototype.getTo = function () {
        return this.to;
    };
    Mail.prototype.getCc = function () {
        return this.cc;
    };
    Mail.prototype.getBcc = function () {
        return this.bcc;
    };
    Mail.prototype.getSubject = function () {
        return this.subject;
    };
    Mail.prototype.getMailSalutation = function () {
        return this.mailSalutation;
    };
    Mail.prototype.getBody = function () {
        return this.body;
    };
    Mail.prototype.getMailSignature = function () {
        return this.mailSignature;
    };
    Mail.prototype.getMainBody = function () {
        return this.mainBody;
    };
    return Mail;
}());
exports.default = Mail;
