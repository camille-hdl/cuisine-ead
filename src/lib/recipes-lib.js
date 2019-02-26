//@flow
import { find, head, last, equals } from "ramda";

const availables = [
    ["supprimer_lb", "Supprimer les <lb>"],
    ["supprimer_label_vide", "Supprimer les labels vides"],
    ["remplacer_sep_plage", "Remplacer '-' par ' à ' dans les unitid plages de cotes"],
    ["remplacer_sep_ext", "Remplacer '-' par '/' dans les unitid (extension)"],
    ["supprimer_commentaire", "Supprimer les commentaires"],
    ["remplacer_date_0", "Remplacer unitdate normal='0' par 's.d.'"],
    ["nettoyer_type", "Nettoyer les attributs 'type'"],
    ["ajouter_altrender", "Ajouter les attributs 'altrender'"],
    ["capitalize_persname", "Capitaliser les noms de famille persname"],
    ["correction_controlaccess", "Corriger les controlaccess avec csv"],
    ["supprimer_whitespace", "Supprimer les tabulations et sauts de ligne dans les textes"],
    ["remplacer_windows", "Remplacer les caractères spéciaux windows (oe, -, ', ...)"],
    ["supprimer_controlaccess", "Supprimer l'indexation dans les controlaccess"],
    ["nettoyer_cotes_consultation", "Nettoyer les unitid type 'cote-de-consultation' et 'cote-future'"],
    ["supprimer_internal", "Supprimer les éléments audience='internal'"],
    ["dedoublonner_indexation", "Dédoublonner l'indexation par branche"],
    ["completer_did_vides", "Compléter les did vides"],
    ["supprimer_ca_vides", "Supprimer les controlaccess vides"],
    ["ajouter_level_file", "Ajouter level=file sur les C de dernier niveau qui n'ont pas de level"],
];

/**
 * If there is a label for the recipe, we return it.
 * Otherwise we return the key.
 */
export const getLabel = (key: string): string => {
    const tuple = find(tuple => equals(head(tuple), key), availables);
    return tuple ? last(tuple) : key;
};
