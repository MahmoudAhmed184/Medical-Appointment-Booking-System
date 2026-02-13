import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    // TODO: Configure SMTP transport
});

export { transporter };
