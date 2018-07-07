import _ from "lodash";
import {initializePostSources} from "./postSources";

const searchPosts = postSearchParams => {
    return initializePostSources()
        .then(postSources => {
            return Promise.all(
                postSources.map((postSource) => {
                    return postSource.getPosts(postSearchParams)
                        .catch((error) => {
                            console.error(error); // eslint-disable-line no-console
                            return [];
                        });
                })
            );
        })
        .then(_.flatten)
        .then(flattenedPosts => {
            return _.sortBy(flattenedPosts, [
                post => -1 * (post.dateCreated ? post.dateCreated.valueOf() : post.datePublished ? post.datePublished.valueOf() : 0)
            ]);
        });
};

export default searchPosts;