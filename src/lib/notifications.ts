// src/lib/notifications.ts
import { prisma } from "@/lib/db";

export type NotificationType = 
  | 'APPOINTMENT_CREATED'
  | 'APPOINTMENT_CONFIRMED' 
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_COMPLETED'
  | 'DOCUMENT_UPLOADED'
  | 'CERTIFICATION_APPROVED'
  | 'NEW_MESSAGE'
  | 'SYSTEM_ALERT';

interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: any;
}

export class NotificationService {
  static async create(data: NotificationData) {
    try {
      return await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          actionUrl: data.actionUrl || null,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null
        }
      });
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  static async createForMultipleUsers(userIds: string[], data: Omit<NotificationData, 'userId'>) {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        type: data.type,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl || null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null
      }));

      return await prisma.notification.createMany({
        data: notifications
      });
    } catch (error) {
      console.error("Error creating notifications for multiple users:", error);
      throw error;
    }
  }

  // Specific notification types for common scenarios

  static async notifyAppointmentCreated(customerId: string, notaryId: string, appointmentId: string, serviceName: string, scheduledTime: Date) {
    const notificationPromises: Promise<any>[] = [];

    // Notify customer
    notificationPromises.push(
      this.create({
        userId: customerId,
        type: 'APPOINTMENT_CREATED',
        title: 'Appointment Request Submitted',
        message: `Your appointment request for ${serviceName} has been submitted and is pending approval.`,
        actionUrl: `/dashboard/customer/appointments?id=${appointmentId}`,
        metadata: { appointmentId, type: 'customer' }
      })
    );

    // Notify notary
    notificationPromises.push(
      this.create({
        userId: notaryId,
        type: 'APPOINTMENT_CREATED',
        title: 'New Appointment Request',
        message: `You have a new appointment request for ${serviceName} scheduled for ${scheduledTime.toLocaleDateString()}.`,
        actionUrl: `/dashboard/notary/appointments?id=${appointmentId}`,
        metadata: { appointmentId, type: 'notary' }
      })
    );

    return Promise.all(notificationPromises);
  }

  static async notifyAppointmentStatusChanged(customerId: string, notaryId: string, appointmentId: string, status: string, serviceName: string) {
    const notificationPromises: Promise<any>[] = [];

    let customerTitle = '';
    let customerMessage = '';
    let notaryTitle = '';
    let notaryMessage = '';

    switch (status) {
      case 'CONFIRMED':
        customerTitle = 'Appointment Confirmed';
        customerMessage = `Your ${serviceName} appointment has been confirmed by the notary.`;
        notaryTitle = 'Appointment Confirmed';
        notaryMessage = `You have confirmed the ${serviceName} appointment.`;
        break;
      case 'CANCELLED':
        customerTitle = 'Appointment Cancelled';
        customerMessage = `Your ${serviceName} appointment has been cancelled.`;
        notaryTitle = 'Appointment Cancelled';
        notaryMessage = `The ${serviceName} appointment has been cancelled.`;
        break;
      case 'COMPLETED':
        customerTitle = 'Appointment Completed';
        customerMessage = `Your ${serviceName} appointment has been completed. Please consider leaving a review.`;
        notaryTitle = 'Appointment Completed';
        notaryMessage = `You have completed the ${serviceName} appointment.`;
        break;
    }

    if (customerTitle) {
      notificationPromises.push(
        this.create({
          userId: customerId,
          type: status === 'CONFIRMED' ? 'APPOINTMENT_CONFIRMED' : 
                status === 'CANCELLED' ? 'APPOINTMENT_CANCELLED' : 'APPOINTMENT_COMPLETED',
          title: customerTitle,
          message: customerMessage,
          actionUrl: `/dashboard/customer/appointments?id=${appointmentId}`,
          metadata: { appointmentId, status, type: 'customer' }
        })
      );
    }

    if (notaryTitle) {
      notificationPromises.push(
        this.create({
          userId: notaryId,
          type: status === 'CONFIRMED' ? 'APPOINTMENT_CONFIRMED' : 
                status === 'CANCELLED' ? 'APPOINTMENT_CANCELLED' : 'APPOINTMENT_COMPLETED',
          title: notaryTitle,
          message: notaryMessage,
          actionUrl: `/dashboard/notary/appointments?id=${appointmentId}`,
          metadata: { appointmentId, status, type: 'notary' }
        })
      );
    }

    return Promise.all(notificationPromises);
  }

  static async notifyDocumentUploaded(customerId: string, documentName: string, appointmentId?: string) {
    const notificationPromises: Promise<any>[] = [];

    // If document is for an appointment, notify the notary
    if (appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          notary: { select: { id: true } },
          service: { select: { name: true } }
        }
      });

      if (appointment) {
        notificationPromises.push(
          this.create({
            userId: appointment.notary.id,
            type: 'DOCUMENT_UPLOADED',
            title: 'New Document Uploaded',
            message: `A customer has uploaded a new document (${documentName}) for your ${appointment.service.name} appointment.`,
            actionUrl: `/dashboard/notary/appointments?id=${appointmentId}`,
            metadata: { appointmentId, documentName, type: 'notary' }
          })
        );
      }
    }

    return Promise.all(notificationPromises);
  }

  static async notifyCertificationApproved(notaryId: string, certificationName: string) {
    return this.create({
      userId: notaryId,
      type: 'CERTIFICATION_APPROVED',
      title: 'Certification Approved',
      message: `Your ${certificationName} certification has been approved by the administrator.`,
      actionUrl: '/dashboard/notary/settings?tab=certifications',
      metadata: { certificationName, type: 'approval' }
    });
  }

  static async notifySystemAlert(userIds: string[], title: string, message: string, actionUrl?: string) {
    return this.createForMultipleUsers(userIds, {
      type: 'SYSTEM_ALERT',
      title,
      message,
      actionUrl,
      metadata: { type: 'system' }
    });
  }

  // Admin notifications for new user registrations
  static async notifyNewUserRegistration(newUserId: string, userName: string, userRole: string) {
    // Get all admin users
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true }
    });

    const adminIds = admins.map(admin => admin.id);

    if (adminIds.length > 0) {
      return this.createForMultipleUsers(adminIds, {
        type: 'SYSTEM_ALERT',
        title: 'New User Registration',
        message: `A new ${userRole.toLowerCase()} has registered: ${userName}`,
        actionUrl: '/dashboard/admin/users',
        metadata: { newUserId, userName, userRole, type: 'registration' }
      });
    }
  }
}