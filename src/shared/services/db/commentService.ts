import { ICommentDocument, ICommentJob, ICommentNameList, IQueryComment } from '@comment/interfaces/commentInterface';
import { CommentsModel } from '@comment/models/commentSchema';
import { IPostDocument } from '@post/interfaces/postInterface';
import { PostModel } from '@post/models/postSchema';
import mongoose, { Query } from 'mongoose';
import { UserCache } from '@service/redis/userCache';
import { IUserDocument } from '@user/interfaces/userInterface';
import { NotificationModel } from '@notification/models/notificationSchema';
import { INotificationDocument, INotificationTemplate } from '@notification/interfaces/notificationInterface';
import { socketIONotificationObject } from '@socket/notification';
import { notificationTemplate } from '@service/emails/templates/notifications/notification';
import { emailQueue } from '@service/queues/emailQueue';

const userCache: UserCache = new UserCache();

class CommentService {
    public async addCommentToDB(commentData: ICommentJob): Promise<void> {
        const { postId, userTo, userFrom, comment, username } = commentData;
        const comments: Promise<ICommentDocument> = CommentsModel.create(comment);
        // Update the commentsCount in the corresponding post document
        const post: Query<IPostDocument, IPostDocument> = PostModel.findOneAndUpdate(
            { _id: postId },
            { $inc: { commentsCount: 1 } },
            { new: true }
        ) as Query<IPostDocument, IPostDocument>;
        // Get user information from the cache
        const user: Promise<IUserDocument> = userCache.getUserFromCache(userTo) as Promise<IUserDocument>;
        // Resolve all promises
        const response: [ICommentDocument, IPostDocument, IUserDocument] = await Promise.all([comments, post, user]);
        if (response[2].notifications.comments && userFrom !== userTo) {
            const notificationModel: INotificationDocument = new NotificationModel();
            const notifications = await notificationModel.insertNotification({
                userFrom,
                userTo,
                message: `${username} commented on your post.`,
                notificationType: 'comment',
                entityId: new mongoose.Types.ObjectId(postId),
                createdItemId: new mongoose.Types.ObjectId(response[0]._id!),
                createdAt: new Date(),
                comment: comment.comment,
                post: response[1].post,
                imgId: response[1].imgId!,
                imgVersion: response[1].imgVersion!,
                gifUrl: response[1].gifUrl!,
                reaction: ''
            });
            socketIONotificationObject.emit('insert notification', notifications, { userTo });
            const templateParams: INotificationTemplate = {
                username: response[2].username!,
                message: `${username} commented on your post.`,
                header: 'Comment Notification'
            };
            const template: string = notificationTemplate.notificationMessageTemplate(templateParams);
            emailQueue.addEmailJob('commentsEmail', { receiverEmail: response[2].email!, template, subject: 'Post notification' });
        }
    }

    public async getPostComments(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentDocument[]> {
        // Aggregation to add and match and sort comments
        const comments: ICommentDocument[] = await CommentsModel.aggregate([{ $match: query }, { $sort: sort }]);
        return comments;
    }

    public async getPostCommentNames(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentNameList[]> {
        // Use aggregation to match, sort, group, and project comment usernames
        const commentsNamesList: ICommentNameList[] = await CommentsModel.aggregate([
            { $match: query },
            { $sort: sort },
            { $group: { _id: null, names: { $addToSet: '$username' }, count: { $sum: 1 } } },
            { $project: { _id: 0 } }
        ]);
        return commentsNamesList;
    }
}

export const commentService: CommentService = new CommentService();
