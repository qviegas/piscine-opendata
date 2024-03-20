<?php
// Vérifiez si l'URI commence par /api

    // Préparez l'URL cible. Vous devriez nettoyer et vérifier les parties de l'URL pour la sécurité.
    $targetUrl = 'https://opendata.bordeaux-metropole.fr/api/explore/v2.1/catalog/datasets/bor_frequentation_piscine_tr/records?limit=20';

    // Initialisez cURL.
    $ch = curl_init($targetUrl);

    // Configurez cURL pour qu'il transmette la réponse directement au client.
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    // Ajoutez d'autres options de cURL ici, comme les en-têtes de requête, les méthodes HTTP, etc.

    // Exécutez la requête cURL.
    $response = curl_exec($ch);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

    // Vérifiez les erreurs.
    if (curl_errno($ch)) {
        // Gérez l'erreur cURL ici.
        http_response_code(500);
        echo "Erreur de proxy";
    } else {
        // Définissez le type de contenu de la réponse.
        header("Content-Type: $contentType");
        // Renvoyez la réponse.
        echo $response;
    }

    // Fermez la session cURL.
    curl_close($ch);

?>
