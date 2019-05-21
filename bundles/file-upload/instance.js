const BasicBundle = Oskari.clazz.get('Oskari.BasicBundle');

Oskari.clazz.defineES(
    'Oskari.file-upload.BundleInstance',
    class LanguageSelectorBundle extends BasicBundle {
        constructor () {
            super();
            this.__name = 'file-upload';
        }
        _startImpl () {
            const root = document.getElementById('language-selector-root');
            if (!root) {
            }
            var flyout = Oskari.clazz.create('Oskari.file-upload.Flyout', 50);
            // ReactDOM.render(<LanguageChanger />, root);
        }
    }
);
