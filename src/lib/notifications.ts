import { prisma } from '@/lib/prisma';

export interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export type NotificationType =
  | 'ORDER_COMPLETED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_CANCELLED'
  | 'PAYMENT_RECEIVED'
  | 'PAYOUT_PROCESSED'
  | 'AGENT_APPROVED'
  | 'AGENT_REJECTED'
  | 'AGENT_FEATURED'
  | 'REVIEW_RECEIVED'
  | 'SYSTEM_ALERT'
  | 'SECURITY_ALERT'
  | 'PROMOTION'
  | 'BONUS'
  | 'ADMIN_MESSAGE';

/**
 * Create a new notification for a user
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  data
}: NotificationData): Promise<boolean> {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: type as string,
        title,
        message,
        data: data ? JSON.stringify(data) : null,
        read: false
      }
    });
    return true;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return false;
  }
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(
  notifications: NotificationData[]
): Promise<{ successful: number; failed: number }> {
  let successful = 0;
  let failed = 0;

  for (const notification of notifications) {
    const success = await createNotification(notification);
    if (success) {
      successful++;
    } else {
      failed++;
    }
  }

  return { successful, failed };
}

/**
 * Create notification when an order is completed
 */
export async function notifyOrderCompleted(
  buyerId: string,
  sellerId: string,
  agentName: string,
  orderAmount: number
): Promise<void> {
  const buyerNotification: NotificationData = {
    userId: buyerId,
    type: 'ORDER_COMPLETED',
    title: 'Order Completed Successfully',
    message: `Your purchase of "${agentName}" has been completed. You can now access your agent.`,
    data: { agentName, amount: orderAmount }
  };

  const sellerNotification: NotificationData = {
    userId: sellerId,
    type: 'PAYMENT_RECEIVED',
    title: 'Payment Received',
    message: `You received a payment of $${(orderAmount / 100).toFixed(2)} for "${agentName}".`,
    data: { agentName, amount: orderAmount }
  };

  await createBulkNotifications([buyerNotification, sellerNotification]);
}

/**
 * Create notification when an agent is approved
 */
export async function notifyAgentApproved(
  sellerId: string,
  agentName: string,
  reason?: string
): Promise<void> {
  const notification: NotificationData = {
    userId: sellerId,
    type: 'AGENT_APPROVED',
    title: 'Agent Approved',
    message: `Your agent "${agentName}" has been approved and is now live on the marketplace.`,
    data: { agentName, reason }
  };

  await createNotification(notification);
}

/**
 * Create notification when an agent is rejected
 */
export async function notifyAgentRejected(
  sellerId: string,
  agentName: string,
  reason?: string
): Promise<void> {
  const notification: NotificationData = {
    userId: sellerId,
    type: 'AGENT_REJECTED',
    title: 'Agent Rejected',
    message: `Your agent "${agentName}" has been rejected. ${reason ? `Reason: ${reason}` : 'Please review and resubmit.'}`,
    data: { agentName, reason }
  };

  await createNotification(notification);
}

/**
 * Create notification when a review is received
 */
export async function notifyReviewReceived(
  sellerId: string,
  agentName: string,
  rating: number,
  reviewerName: string
): Promise<void> {
  const notification: NotificationData = {
    userId: sellerId,
    type: 'REVIEW_RECEIVED',
    title: 'New Review Received',
    message: `${reviewerName} left a ${rating}-star review for "${agentName}".`,
    data: { agentName, rating, reviewerName }
  };

  await createNotification(notification);
}

/**
 * Create system alert notification for all admins
 */
export async function notifyAdmins(
  title: string,
  message: string,
  data?: Record<string, unknown>
): Promise<void> {
  try {
    // Get all admin users
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true }
    });

    const notifications: NotificationData[] = admins.map(admin => ({
      userId: admin.id,
      type: 'SYSTEM_ALERT',
      title,
      message,
      data
    }));

    await createBulkNotifications(notifications);
  } catch (error) {
    console.error('Failed to notify admins:', error);
  }
}

/**
 * Create promotion notification for all users
 */
export async function notifyPromotion(
  title: string,
  message: string,
  data?: Record<string, unknown>
): Promise<void> {
  try {
    // Get all active users (limit to avoid overwhelming the system)
    const users = await prisma.user.findMany({
      select: { id: true },
      take: 1000 // Limit to prevent performance issues
    });

    const notifications: NotificationData[] = users.map(user => ({
      userId: user.id,
      type: 'PROMOTION',
      title,
      message,
      data
    }));

    // Process in batches to avoid overwhelming the system
    const batchSize = 100;
    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize);
      await createBulkNotifications(batch);

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } catch (error) {
    console.error('Failed to send promotion notifications:', error);
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<boolean> {
  try {
    await prisma.notification.update({
      where: {
        id: notificationId,
        userId: userId // Ensure user owns the notification
      },
      data: { read: true }
    });
    return true;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return false;
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<boolean> {
  try {
    await prisma.notification.delete({
      where: {
        id: notificationId,
        userId: userId // Ensure user owns the notification
      }
    });
    return true;
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return false;
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    return await prisma.notification.count({
      where: {
        userId,
        read: false
      }
    });
  } catch (error) {
    console.error('Failed to get unread count:', error);
    return 0;
  }
}
