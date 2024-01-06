import { ICommentDocument, ICommentJob, ICommentNameList, IQueryComment } from '@comment/interfaces/commentInterface';
import { CommentsModel } from '@comment/models/commentSchema';
import { IPostDocument } from '@post/interfaces/postInterface';
import { PostModel } from '@post/models/postSchema';
import mongoose, { Query } from 'mongoose';
import { UserCache } from '@service/redis/userCache';
import { IUserDocument } from '@user/interfaces/userInterface';

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
