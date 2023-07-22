export default class MixerHelpers {
    parents (start, target) {
        let parent = start;

        while (parent) {
            if (!parent.localName) break;

            const targetSplit = target.split(":"),
                key = targetSplit[0],
                value = targetSplit[1];

            if (parent.localName && parent.dataset[key] === value) {
                return parent;
            }

            parent = parent.parentNode;
        }

        return false;
    }
}
