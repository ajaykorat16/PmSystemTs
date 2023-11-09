import nodemailer from 'nodemailer';
import momentTimezone from 'moment-timezone';
import moment from 'moment';
import * as fs from 'fs';
import Users, { IUser } from '../models/user';

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST as string,
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_AUTH_USER as string,
        pass: process.env.MAIL_AUTH_PASS as string,
    },
});

const parseIndianDate = (
    date: string,
    input: string = 'ddd MMM DD YYYY HH:mm:ss Z+HHmm',
    format: string = 'YYYY-MM-DD'
): string => {
    const utcDateTime = momentTimezone(date, input).tz('UTC');
    const indianDateTime = utcDateTime.clone().tz('Asia/Kolkata');
    return indianDateTime.format(format);
};

const formattedDate = (date: Date): string => {
    return moment(date).format('DD-MM-YYYY');
};

const parsedDate = (date: string, format: string = 'YYYY-MM-DD'): string => {
    const indianDateTime = momentTimezone(date, 'YYYY-MM-DD').tz('Asia/Kolkata');
    return indianDateTime.format(format);
};

function capitalizeFLetter(string: string | undefined): string {
    if (typeof string !== 'undefined') {
        return string[0].toUpperCase() + string.slice(1);
    } else {
        return '-';
    }
}

function formatteDayType(dayType: string): string {
    switch (dayType) {
        case 'single':
            return 'Single Day';
        case 'multiple':
            return 'Multiple Day';
        case 'first_half':
            return 'First Half';
        case 'second_half':
            return 'Second Half';
        default:
            return '-';
    }
}

function parsedDayType(dayType: string): string {
    switch (dayType) {
        case 'Single Day':
            return 'single';
        case 'Multiple Day':
            return 'multiple';
        case 'First Half':
            return 'first_half';
        case 'Second Half':
            return 'second_half';
        default:
            return 'single';
    }
}

const sendMailForLeaveStatus = async (
    data: {
        startDate: Date;
        endDate: Date;
        reason: string;
        totalDays: string;
        status: string;
        leaveType: string;
        leaveDayType: string;
        userId: string;
    },
    reasonForLeaveReject: string
): Promise<{ error: boolean; message: string }> => {
    try {
        const body: string = await new Promise<string>((resolve, reject) => {
            fs.readFile('../templates/email_leaveResponse.html', 'utf8', (err, content) => {
                if (err) {
                    console.log("Mail.sendLeaveRequest [ERROR: " + err + " ]");
                    reject(err);
                } else {
                    resolve(content);
                }
            });
        });

        const { startDate, endDate, reason, totalDays, status, leaveType, leaveDayType, userId } = data;

        const adminUser: IUser = await Users.findOne({ email: process.env.ADMIN_EMAIL as string }).select('-photo');
        const employee: any = await Users.findOne({ _id: userId }).select('-photo').populate('department');

        let mailBody = body.replace('{userName}', employee.fullName);
        mailBody = mailBody.replace('{department}', employee?.department?.name);
        mailBody = mailBody.replace('{reason}', capitalizeFLetter(reason));
        mailBody = mailBody.replace('{leaveType}', capitalizeFLetter(leaveType));
        mailBody = mailBody.replace('{leaveDayType}', formatteDayType(leaveDayType));
        mailBody = mailBody.replace('{startDate}', formattedDate(startDate));
        mailBody = mailBody.replace('{endDate}', formattedDate(endDate));
        mailBody = mailBody.replace('{totalDays}', totalDays);
        mailBody = mailBody.replace('{reasonForLeaveReject}', capitalizeFLetter(reasonForLeaveReject));
        mailBody = mailBody.replace('{status}', capitalizeFLetter(status));
        mailBody = mailBody.replace('{adminName}', adminUser.fullName);

        const mailOptions = {
            from: `"Kriva Technolabs" <${process.env.MAIL_FROM_EMAIL as string}>`,
            to: employee.email,
            subject: 'Your Leave Request Update',
            html: mailBody,
        };

        await new Promise<{ error: boolean; message: string }>((resolve, reject) => {
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.log("Mail.sendEmail [ERROR: " + err + "]");
                    reject({ error: true, message: err });
                } else {
                    console.log("Mail.sendEmail [SUCCESS]");
                    resolve({ error: false, message: "Email sent successfully!" });
                }
            });
        });

        return { error: false, message: 'Email sent successfully!' };
    } catch (error) {
        console.error('Error sending email:', error);
        return { error: true, message: 'Failed to send email.' };
    }
};

const sendMailForLeaveRequest = async (
    data: {
        reason: string;
        startDate: Date;
        endDate: Date;
        userId: string;
        totalDays: string;
        leaveType: string;
        leaveDayType: string;
    }
): Promise<{ error: boolean; message: string }> => {
    try {
        const body: string = await new Promise<string>((resolve, reject) => {
            fs.readFile('../templates/email_leaveRequest.html', 'utf8', (err, content) => {
                if (err) {
                    console.log("Mail.sendLeaveRequest [ERROR: " + err + " ]");
                    reject(err);
                } else {
                    resolve(content);
                }
            });
        });

        const { reason, startDate, endDate, userId, totalDays, leaveType, leaveDayType } = data;

        const adminUser: IUser = await Users.findOne({ email: process.env.ADMIN_EMAIL as string }).select('-photo');
        const employee: any = await Users.findOne({ _id: userId }).select('-photo').populate('department');

        let mailBody = body.replace('{adminName}', adminUser.fullName);
        mailBody = mailBody.replace('{userName}', employee.fullName);
        mailBody = mailBody.replace('{department}', employee?.department?.name);
        mailBody = mailBody.replace('{leaveType}', capitalizeFLetter(leaveType));
        mailBody = mailBody.replace('{leaveDayType}', formatteDayType(leaveDayType));
        mailBody = mailBody.replace('{startDate}', formattedDate(startDate));
        mailBody = mailBody.replace('{endDate}', formattedDate(endDate));
        mailBody = mailBody.replace('{reason}', reason);
        mailBody = mailBody.replace('{totalDays}', totalDays);
        mailBody = mailBody.replace('{userName}', employee.fullName);
        mailBody = mailBody.replace('{phoneNumber}', employee.phone);

        const mailOptions = {
            from: `"Kriva Technolabs" <${process.env.MAIL_FROM_EMAIL as string}>`,
            to: adminUser.email,
            subject: 'Leave Request',
            html: mailBody,
        };

        await new Promise<{ error: boolean; message: string }>((resolve, reject) => {
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.log("Mail.sendEmail [ERROR: " + err + "]");
                    reject({ error: true, message: err });
                } else {
                    console.log("Mail.sendEmail [SUCCESS]");
                    resolve({ error: false, message: 'Email sent successfully!' });
                }
            });
        });

        return { error: false, message: 'Email sent successfully!' };
    } catch (error) {
        console.error('Error sending email:', error);
        return { error: true, message: 'Failed to send email.' };
    }
};

export {
    sendMailForLeaveStatus,
    sendMailForLeaveRequest,
    formattedDate,
    capitalizeFLetter,
    parsedDate,
    parseIndianDate,
    formatteDayType,
    parsedDayType,
};
