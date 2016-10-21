require("dotenv").config();

const PhotoSource = require("../photoSource");
const Photo = require("../photo");
const Creator = require("../creator");
const SizedPhoto = require("../sizedPhoto");
const SearchParams = require("../searchParams");
const Instagram = require("instagram-api");
const Moment = require("moment");
const _ = require("lodash");

class InstagramSource extends PhotoSource {
	constructor() {
		super("Instagram", new Instagram(process.env.INSTAGRAM_ACCESS_TOKEN));
	}

	getUserPhotos(params) {
		params = params instanceof SearchParams ? params : new SearchParams(params);
		const that = this;
		const client = this.client;
		const userId = process.env.INSTAGRAM_USER_ID;
		let instagramRequest = Promise.resolve(userId);

		if (!userId) {
			instagramRequest = client.userSearch(process.env.INSTAGRAM_USER_NAME)
				.then((userJson) => {
					return _.find(userJson.data, {username: process.env.INSTAGRAM_USER_NAME}).id;
				});
		}

		return instagramRequest
			.then((userId) => {
				return client.userMedia(userId, params.toInstagram());
			})
			.then((mediaJson) => {
				return _.chain(mediaJson.data)
					.filter({type: "image"})
					.map(_.bind(that.jsonToPhoto, that))
					.value();
			});
	}

	getPhoto(photoId) {
		const that = this;

		return this.client.media(photoId)
			.then((photoJson) => {
				return that.jsonToPhoto(photoJson.data);
			});
	}

	jsonToPhoto(photoJson) {
		const sizedPhotos = Object.keys(photoJson.images).map((key) => {
			const image = photoJson.images[key];
			return new SizedPhoto(image.url, image.width, image.height, key);
		});

		return new Photo(
			photoJson.id,
			this.type,
			Moment(parseInt(photoJson.created_time, 10) * 1000),
			null,
			_.last(_.sortBy(sizedPhotos, ["width"])).width,
			_.last(_.sortBy(sizedPhotos, ["height"])).height,
			sizedPhotos,
			photoJson.link,
			photoJson.filter,
			photoJson.caption && photoJson.caption.text,
			new Creator(
				photoJson.user.username,
				photoJson.user.username,
				photoJson.user.full_name,
				`https://www.instagram.com/${photoJson.username}`
			)
		);
	}

	get isEnabled() {
		return !!process.env[`${this.type.toUpperCase()}_ACCESS_TOKEN`];
	}
}

module.exports = InstagramSource;