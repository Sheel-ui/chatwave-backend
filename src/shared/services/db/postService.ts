import { IPostDocument, IGetPostsQuery, IQueryComplete, IQueryDeleted } from '@post/interfaces/postInterface';
import { PostModel } from '@post/models/postSchema';
import { IUserDocument } from '@user/interfaces/userInterface';
import { UserModel } from '@user/models/user.schema';
import { Query, UpdateQuery } from 'mongoose';

class PostService {
    public async addPostToDB(userId: string, createdPost: IPostDocument): Promise<void> {
        // Create a new post using the PostModel
        const post: Promise<IPostDocument> = PostModel.create(createdPost);
        // Increment the postsCount for the user in the UserModel
        const user: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: 1 } });
        await Promise.all([post, user]);
    }

    // Method to retrieve posts from the database based on specified query, skip, limit, and sort options
    public async getPosts(query: IGetPostsQuery, skip = 0, limit = 0, sort: Record<string, 1 | -1>): Promise<IPostDocument[]> {
        // Construct the postQuery based on the provided query parameters
        let postQuery = {};
        if (query?.imgId && query?.gifUrl) {
            postQuery = { $or: [{ imgId: { $ne: '' } }, { gifUrl: { $ne: '' } }] };
        } else if (query?.videoId) {
            postQuery = { $or: [{ videoId: { $ne: '' } }] };
        } else {
            postQuery = query;
        }

        // Perform an aggregation query on the PostModel
        const posts: IPostDocument[] = await PostModel.aggregate([
            { $match: postQuery },
            { $sort: sort },
            { $skip: skip },
            { $limit: limit }
        ]);
        return posts;
    }

    public async postsCount(): Promise<number> {
        const count: number = await PostModel.find({}).countDocuments();
        return count;
    }

    // Method to delete a post from the database
    public async deletePost(postId: string, userId: string): Promise<void> {
        const deletePost: Query<IQueryComplete & IQueryDeleted, IPostDocument> = PostModel.deleteOne({ _id: postId });
        const decrementPostCount: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: -1 } });
        await Promise.all([deletePost, decrementPostCount]);
    }

    // Method to edit/update a post in the database
    public async editPost(postId: string, updatedPost: IPostDocument): Promise<void> {
        const updatePost: UpdateQuery<IPostDocument> = PostModel.updateOne({ _id: postId }, { $set: updatedPost });
        await Promise.all([updatePost]);
    }
}

export const postService: PostService = new PostService();
