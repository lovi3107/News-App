import axios from 'axios';
import { appUrl } from './client';
import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from 'react-query';

// fetching posts for home page
const fetchPosts = ({ pageParam = 1 }, limit) => {
	return axios.get(`${appUrl}/posts?limit=${limit}&page=${pageParam}`);
};

export const useGetPosts = (limit) => {
	return useInfiniteQuery('get-latest-posts', (p) => fetchPosts(p, limit), {
		getNextPageParam: (lastPage, pages) => {
			let total = Math.ceil(lastPage?.data?.count / limit);
			if (pages.length < total) {
				return pages.length + 1;
			} else {
				return undefined;
			}
		},
	});
};

// searching posts in explore page
const searchPosts = (limit, page = 1, search = '') => {
	return axios.get(
		`${appUrl}/posts/search?limit=${limit}&page=${page}&search=${search}`
	);
};

export const useSearchPosts = (page, limit, search) => {
	return useQuery(
		['search-posts', page, search],
		() => searchPosts(limit, page, search)
		// { keepPreviousData: true }
	);
};

// get post comments/details
const getPostComments = (postId) => {
	return axios.get(`${appUrl}/posts/${postId}`);
};

export const useGetPostComments = (postId) => {
	return useQuery(['post-comments', postId], () => getPostComments(postId));
};

// upvote/downvote a post
const vote = ({ postId, userId }) => {
	return axios.put(`${appUrl}/posts/votes/${postId}`, { userId });
};

export const useUpvotePost = () => {
	const queryClient = useQueryClient();
	return useMutation(vote, {
		onSuccess: (_, { postId }) => {
			queryClient.invalidateQueries('get-latest-posts');
			queryClient.invalidateQueries('search-posts');
			queryClient.invalidateQueries(['post-comments', postId]);
		},
	});
};
