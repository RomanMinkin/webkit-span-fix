// Plugin registrieren
CKEDITOR.plugins.add('hotfix', {
 
        // Plugin initialisiert
        init : function(editor) {
 
                ////////////////////////////////////////////////////////////////////////
                // Webkit Span Bugfix //////////////////////////////////////////////////
                ////////////////////////////////////////////////////////////////////////
 
                // Nur für Webkit Browser
                if ( CKEDITOR.env.webkit ) {
 
                        console.log('>>> Using Webkit Span Bugfix');
 
                        var getParentsToClosestBlockElement = function(node) {
 
                                var parentsToBlockElement = new Array();
 
                                if ( node instanceof CKEDITOR.dom.element || node instanceof CKEDITOR.dom.text ) {
 
                                        // Alle Elternknoten des Knotens holen (inkl. des Knotens selbst)
                                        var parents = node.getParents(true);
 
                                        // Wenn Elternknoten vorhanden
                                        if ( parents != null ) {
 
                                                // Elternelementse durchschleifen
                                                for ( var i = 0; i < parents.length; i++ ) {
 
                                                        parentsToBlockElement[i] = parents[i];
 
                                                        // Wenn Elternelement ein Blockelement, dann das vorherige
                                                        // Elternelement wegspeichern und abbrechen
                                                        if ( i >= 1 && parents[i] instanceof CKEDITOR.dom.element
                                                                && parents[i].getComputedStyle('display') == 'block' ) {
 
                                                                break;
 
                                                        }
 
                                                }
 
                                        }
 
                                }
 
                                return parentsToBlockElement;
 
                        }
 
                        var getNextNodeSiblingsOfSelection = function() {
 
                                // Rückgabearray
                                var siblings = new Array();
 
                                // Selektion holen
                                var selection = editor.getSelection();
 
                                var nextNode = null;
 
                                // Wenn Selektion vorhanden
                                if ( selection != null ) {
 
                                        // Ranges der Selektion holen
                                        var ranges = selection.getRanges();
 
                                        // Wenn Ranges vorhanden
                                        if ( ranges.length ) {
 
                                                var nextNode = ranges[0].getNextNode();
 
                                                // Wenn Knoten vorhanden
                                                if ( nextNode != null ) {
 
                                                        var nextNodeParents = getParentsToClosestBlockElement(nextNode);
 
                                                        // Wenn Element vorhanden
                                                        if ( nextNodeParents[nextNodeParents.length - 2] != undefined ) {
 
                                                                var element = nextNodeParents[nextNodeParents.length - 2];
 
                                                                // Das Element und alle seine nachfolgenden Elemente (in der gleichen Ebene)
                                                                // wegspeichern
                                                                do {
 
                                                                        siblings.push(element);
                                                                        element = element.getNext();
 
                                                                } while ( element != null );
 
                                                        }
 
                                                }
 
                                        }
 
                                }
 
                                var redoSelection = function() {
 
                                        if ( selection != null && ranges != null && ranges.length ) {
 
                                                selection.selectRanges(ranges);
 
                                        }
 
                                }
 
                                return {
                                        'siblings':             siblings,
                                        'redoSelection':        redoSelection,
                                        'nextNode':             nextNode
                                };
 
                        }
 
                        // Wenn Editor im Editierungsmodus ist (WYSIWYG Modus)
                        editor.on('contentDom', function() {
 
                                // Wenn KeyDown Event getriggert wurde
                                editor.document.on('keydown', function(event) {
 
                                        var nextNodeSiblingsOnKeyDown = getNextNodeSiblingsOfSelection();
 
                                        // Einmalig beim keyDown Event das KeyUp Event binden
                                        // => Wird dann aufgerufen, nachdem Chrome die SPANs gesetzt hat! ;)
                                        editor.document.once('keyup', function(event) {
 
                                                var nextNodeSiblingsOnKeyUp = getNextNodeSiblingsOfSelection();
 
                                                var blockElementsMerged = false;
 
                                                if ( nextNodeSiblingsOnKeyDown.nextNode != null
                                                        && nextNodeSiblingsOnKeyUp.nextNode != null ) {
 
                                                        var nextNodeOnKeyDownParents = getParentsToClosestBlockElement(nextNodeSiblingsOnKeyDown.nextNode);
                                                        var nextNodeOnKeyUpParents = getParentsToClosestBlockElement(nextNodeSiblingsOnKeyUp.nextNode);
 
                                                        if ( nextNodeOnKeyDownParents[nextNodeOnKeyDownParents.length - 1].getAddress().join('|')
                                                                != nextNodeOnKeyUpParents[nextNodeOnKeyUpParents.length - 1].getAddress().join('|') ) {
 
                                                                blockElementsMerged = true;
 
                                                        }
 
                                                }
 
                                                if ( blockElementsMerged ) {
 
                                                        console.log('>>> Detected merge of block elements');
 
                                                        for ( var i = 0; i < nextNodeSiblingsOnKeyDown.siblings.length; i++ ) {
 
                                                                if ( nextNodeSiblingsOnKeyUp.siblings[i] == undefined ) break;
 
                                                                nodeBeforeKey   = nextNodeSiblingsOnKeyDown.siblings[i];
                                                                nodeAfterKey    = nextNodeSiblingsOnKeyUp.siblings[i];
 
                                                                // Textknoten wurde in einen Span umgewandelt
                                                                if ( nodeBeforeKey instanceof CKEDITOR.dom.text
                                                                        && nodeAfterKey instanceof CKEDITOR.dom.element
                                                                        && nodeAfterKey.getName() == 'span' ) {
 
                                                                        console.log('>>> Remove Webkit Span', nodeAfterKey.getOuterHtml());
 
                                                                        nodeAfterKey.remove(true);
 
                                                                // In einem Span Element wurde das Style-Attribut geändert
                                                                } else if ( nodeBeforeKey instanceof CKEDITOR.dom.element
                                                                        && nodeBeforeKey.getName() == 'span'
                                                                        && nodeAfterKey instanceof CKEDITOR.dom.element
                                                                        && nodeAfterKey.getName() == 'span'
                                                                        && nodeAfterKey.getAttribute('style') != nodeBeforeKey.getAttribute('style') ) {
 
                                                                        console.log('>>> Update Webkit Span Style Attribute', nodeAfterKey.getOuterHtml(), 'to', nodeBeforeKey.getAttribute('style'));
 
                                                                        nodeAfterKey.setAttribute('style', nodeBeforeKey.getAttribute('style'));
 
                                                                }
 
                                                                // Bugfix => Selektion wiederherstellen
                                                                nextNodeSiblingsOnKeyUp.redoSelection();
 
                                                        }
 
                                                }
 
                                        });
 
                                });
 
                        });
 
                }
 
        }
});

