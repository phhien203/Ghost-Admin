import Controller from '@ember/controller';
import {alias} from '@ember/object/computed';
import {computed} from '@ember/object';
import {get} from '@ember/object';
import {inject as service} from '@ember/service';

const TYPES = [{
    name: 'Tất cả bài viết',
    value: null
}, {
    name: 'Bài viết nháp',
    value: 'draft'
}, {
    name: 'Bài viết đã đăng',
    value: 'published'
}, {
    name: 'Bài viết được lên lịch',
    value: 'scheduled'
}, {
    name: 'Bài viết nổi bật',
    value: 'featured'
}];

const ORDERS = [{
    name: 'Mới nhất',
    value: null
}, {
    name: 'Cũ nhất',
    value: 'published_at asc'
}, {
    name: 'Cập nhật gần nhất',
    value: 'updated_at desc'
}];

export default Controller.extend({

    store: service(),

    queryParams: ['type', 'author', 'tag', 'order'],

    type: null,
    author: null,
    tag: null,
    order: null,

    _hasLoadedTags: false,
    _hasLoadedAuthors: false,

    availableTypes: null,
    availableOrders: null,

    init() {
        this._super(...arguments);
        this.availableTypes = TYPES;
        this.availableOrders = ORDERS;
    },

    postsInfinityModel: alias('model'),

    showingAll: computed('type', 'author', 'tag', function () {
        let {type, author, tag} = this.getProperties(['type', 'author', 'tag']);

        return !type && !author && !tag;
    }),

    selectedType: computed('type', function () {
        let types = this.get('availableTypes');
        return types.findBy('value', this.get('type')) || {value: '!unknown'};
    }),

    selectedOrder: computed('order', function () {
        let orders = this.get('availableOrders');
        return orders.findBy('value', this.get('order')) || {value: '!unknown'};
    }),

    _availableTags: computed(function () {
        return this.get('store').peekAll('tag');
    }),

    availableTags: computed('_availableTags.[]', function () {
        let tags = this.get('_availableTags')
            .filter(tag => tag.get('id') !== null)
            .sort((tagA, tagB) => tagA.name.localeCompare(tagB.name, undefined, {ignorePunctuation: true}));
        let options = tags.toArray();
        options.unshiftObject({name: 'Tất cả thẻ', slug: null});

        return options;
    }),

    selectedTag: computed('tag', '_availableTags.[]', function () {
        let tag = this.get('tag');
        let tags = this.get('availableTags');

        return tags.findBy('slug', tag) || {slug: '!unknown'};
    }),

    _availableAuthors: computed(function () {
        return this.get('store').peekAll('user');
    }),

    availableAuthors: computed('_availableAuthors.[]', function () {
        let authors = this.get('_availableAuthors');
        let options = authors.toArray();

        options.unshiftObject({name: 'Tất cả tác giả', slug: null});

        return options;
    }),

    selectedAuthor: computed('author', 'availableAuthors.[]', function () {
        let author = this.get('author');
        let authors = this.get('availableAuthors');

        return authors.findBy('slug', author) || {slug: '!unknown'};
    }),

    actions: {
        changeType(type) {
            this.set('type', get(type, 'value'));
        },

        changeAuthor(author) {
            this.set('author', get(author, 'slug'));
        },

        changeTag(tag) {
            this.set('tag', get(tag, 'slug'));
        },

        changeOrder(order) {
            this.set('order', get(order, 'value'));
        },

        openEditor(post) {
            this.transitionToRoute('editor.edit', 'post', post.get('id'));
        }
    }
});
