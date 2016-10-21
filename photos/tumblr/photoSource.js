require("dotenv").config();

const PhotoSource = require("../photoSource");
const Photo = require("../photo");
const Creator = require("../creator");
const SizedPhoto = require("../sizedPhoto");
const SearchParams = require("../searchParams");
const tumblr = require("tumblr.js");
const Moment = require("moment");
const _ = require("lodash");

class TumblrSource extends PhotoSource {
	constructor() {
		super("Tumblr", tumblr.createClient({
			consumer_key: process.env.TUMBLR_API_KEY,
			consumer_secret: process.env.TUMBLR_API_SECRET,
			returnPromises: true
		}));
	}

	getUserPhotos(params) {
		params = params instanceof SearchParams ? params : new SearchParams(params);
		const that = this;

		return this.client.blogPosts(process.env.TUMBLR_USER_NAME, params.toTumblr())
			.then((response) => {
				return _.chain(response.posts)
					.map((postJson) => {
						return postJson.photos.map((photoJson) => {
							return that.jsonToPhoto(photoJson, postJson, response.blog);
						});
					})
					.flatten()
					.value();
			});
	}

	getPhoto(photoId, params) {
		const that = this;

		return this.client.blogPosts(process.env.TUMBLR_USER_NAME, _.extend({id: photoId}, params.toTumblr()))
			.then((response) => {
				return _.chain(response.posts)
					.map((postJson) => {
						return postJson.photos.map((photoJson) => {
							return that.jsonToPhoto(photoJson, postJson, response.blog);
						});
					})
					.flatten()
					.value();
			});
	}

	jsonToPhoto(photoJson, postJson, blogJson) {
		const sizedPhotos = photoJson.alt_sizes.map((photo) => {
			return new SizedPhoto(photo.url, photo.width, photo.height);
		});

		return new Photo(
			postJson.id,
			this.type,
			Moment(postJson.date),
			null,
			_.last(_.sortBy(sizedPhotos, ["width"])).width,
			_.last(_.sortBy(sizedPhotos, ["height"])).height,
			sizedPhotos,
			postJson.post_url,
			postJson.caption,
			photoJson.caption,
			new Creator(
				blogJson.name,
				blogJson.name,
				blogJson.title,
				blogJson.url
			)
		);
	}
}

module.exports = TumblrSource;