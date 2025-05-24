// services/workflowExecutor.js (or similar)
const agenda = require('../config/agenda');
const nodemailer = require('nodemailer');
const Workflow = require('../models/workflowModel');
const Appointment = require('../models/appointmentModel'); // Assuming you have this
const Customer = require('../models/CustomerModel');
// Add other models like ITConsultingEvent, Specialist if needed for email content

// --- Nodemailer Setup (configure with your email provider) ---
/*const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});*/

const user = process.env.GMAIL_USER || 'ch23799@gmail.com';
const pass = process.env.GMAIL_PASS || 'prlg tbrs bnsk gljy';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: user,
        pass: pass,
    }
});
// --- Helper to get sender/reply-to email addresses ---
async function getEmailAddress(configKey, appointmentData) {
    // This is a placeholder. You'll need to implement logic based on your config keys.
    // e.g., 'super_admin' -> fetch from config
    // 'allocated_it_specialist' -> find specialist from appointmentData, get their email
    // 'service_provider' -> find service provider email

    if (configKey === 'super_admin') {
        return process.env.SUPER_ADMIN_EMAIL || 'noreply@example.com';
    }
    if (configKey === 'allocated_it_specialist' && appointmentData && appointmentData.specialistId) {
        // const specialist = await Specialist.findById(appointmentData.specialistId);
        // return specialist ? specialist.email : 'noreply@example.com';
        return 'specialist_email_placeholder@example.com'; // Replace with actual logic
    }
    // Add more cases
    return 'noreply@example.com'; // Default
}


// --- Define the "Send Workflow Email" Job ---
agenda.define('send workflow email', { priority: 'high', concurrency: 10 }, async (job) => {
    const { workflowId, appointmentId, customerId } = job.attrs.data;
    console.log(`Processing 'send workflow email' for workflow ${workflowId} and appointment ${appointmentId}`);

    try {
        const workflow = await Workflow.findById(workflowId);
        const appointment = await Appointment.findById(appointmentId)
                                        .populate('itConsultingId', 'consultingName') // Populate service name
                                        .populate('specialistId', 'name'); // Populate specialist name
        const customer = await Customer.findById(customerId);

        if (!workflow || !appointment || !customer) {
            console.error('Missing data for job:', { workflowId, appointmentId, customerId });
            // Optional: job.fail('Missing data');
            return;
        }

        if (workflow.action !== 'Send email' || !workflow.emailTemplate) {
            console.log(`Workflow ${workflowId} is not an email action or has no template. Skipping.`);
            return;
        }
        
        // Check if appointment still matches criteria (e.g., not cancelled)
        if (appointment.status === 'cancelled') {
            console.log(`Appointment ${appointmentId} is cancelled. Skipping email.`);
            return;
        }


        // Personalize email content
        let subject = workflow.emailTemplate.subject || 'Follow Up';
        let bodyHtml = workflow.emailTemplate.bodyHtml || '<p>This is a follow-up email.</p>';

        subject = subject.replace(/%customername%/g, customer.customerName || 'Valued Customer');
        subject = subject.replace(/%servicename%/g, appointment.itConsultingId?.consultingName || 'Your Service');
        // Add more placeholder replacements

        bodyHtml = bodyHtml.replace(/%customername%/g, customer.customerName || 'Valued Customer');
        bodyHtml = bodyHtml.replace(/%servicename%/g, appointment.itConsultingId?.consultingName || 'Your Service');
        bodyHtml = bodyHtml.replace(/%businessname%/g, process.env.BUSINESS_NAME || 'Our Company');
        // Add more placeholder replacements, e.g., date, specialist name

        const fromEmail = await getEmailAddress(workflow.emailTemplate.senderEmailConfig, appointment);
        const replyToEmail = await getEmailAddress(workflow.emailTemplate.replyToEmailConfig, appointment);

        const mailOptions = {
            from: `"${process.env.BUSINESS_NAME || 'Your Company'}" <${fromEmail}>`,
            to: customer.emailAddress,
            replyTo: replyToEmail,
            subject: subject,
            html: bodyHtml,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${customer.emailAddress} for workflow ${workflow.name}`);

    } catch (error) {
        console.error(`Error sending email for job ${job.attrs._id}:`, error);
        throw error; 
    }
});


// --- Start Agenda (typically in your main server file after defining jobs) ---
async function startAgenda() {
    await agenda.start();
    console.log('Agenda started successfully.');
    // Example: Graceful shutdown
    // process.on('SIGTERM', graceful);
    // process.on('SIGINT', graceful);
}

// function graceful() {
//   agenda.stop(() => process.exit(0));
// }

module.exports = { agenda, startAgenda }; // Export startAgenda to call it