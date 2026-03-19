import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Video {
    id: string;
    title: string;
    creator: Principal;
    duration: bigint;
    reportCount: bigint;
    thumbnailKey: ExternalBlob;
    hashtags: Array<string>;
    blobKey: ExternalBlob;
    createdAt: Time;
    description: string;
    score: bigint;
    sharesCount: bigint;
    commentsCount: bigint;
    likesCount: bigint;
    musicName: string;
    savesCount: bigint;
    isRemoved: boolean;
}
export interface PartialUserProfile {
    bio: string;
    username: string;
    avatarBlobKey?: ExternalBlob;
    followerCount: bigint;
    followingCount: bigint;
}
export type Time = bigint;
export interface Comment {
    createdAt: Time;
    text: string;
    author: Principal;
    videoId: string;
}
export interface Notification {
    userId: Principal;
    createdAt: Time;
    isRead: boolean;
    message: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(videoId: string, text: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    banUser(user: Principal): Promise<void>;
    followUser(followee: Principal): Promise<void>;
    getAllUsers(): Promise<Array<[Principal, PartialUserProfile]>>;
    getAnalytics(): Promise<{
        totalReports: bigint;
        totalVideos: bigint;
        totalUsers: bigint;
    }>;
    getCallerUserProfile(): Promise<PartialUserProfile>;
    getCallerUserRole(): Promise<UserRole>;
    getFollowingUsers(user: Principal): Promise<Array<Principal>>;
    getMyProfile(): Promise<PartialUserProfile>;
    getNotifications(): Promise<Array<Notification>>;
    getProfile(user: Principal): Promise<PartialUserProfile>;
    getTrendingHashtags(): Promise<Array<string>>;
    getTrendingVideos(): Promise<Array<Video>>;
    getUserProfile(user: Principal): Promise<PartialUserProfile>;
    getUserVideos(user: Principal): Promise<Array<Video>>;
    getVideoComments(videoId: string): Promise<Array<Comment>>;
    isCallerAdmin(): Promise<boolean>;
    likeVideo(videoId: string): Promise<void>;
    register(username: string, bio: string, avatarBlobKey: ExternalBlob | null): Promise<void>;
    removeVideo(videoId: string): Promise<void>;
    reportVideo(videoId: string, reason: string): Promise<void>;
    saveCallerUserProfile(username: string, bio: string, avatarBlobKey: ExternalBlob | null): Promise<void>;
    searchHashtags(searchTerm: string): Promise<Array<string>>;
    searchUsers(searchTerm: string): Promise<Array<[Principal, PartialUserProfile]>>;
    searchVideos(searchTerm: string): Promise<Array<Video>>;
    uploadVideo(id: string, title: string, description: string, hashtags: Array<string>, blobKey: ExternalBlob, thumbnailKey: ExternalBlob, musicName: string, duration: bigint): Promise<void>;
}
