function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nom, entreprise, email, fournisseur, message } = req.body;

  // Validation basique
  if (!nom || !entreprise || !email || !fournisseur) {
    return res.status(400).json({ error: 'Champs obligatoires manquants (Nom, Entreprise, Email, Fournisseur)' });
  }

  // Utilisation sécurisée de la clé via les variables d'environnement Vercel
  const BREVO_API_KEY = process.env.BREVO_API_KEY;

  if (!BREVO_API_KEY) {
    console.error('Erreur : La variable d\'environnement BREVO_API_KEY n\'est pas configurée.');
    return res.status(500).json({ error: 'Configuration serveur manquante (Variable BREVO_API_KEY non trouvée sur Vercel)' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'Data Sovereign Formulaire', email: 'Martin.decombarieu@gmail.com' },
        to: [{ email: 'Martin.decombarieu@gmail.com', name: 'Martin de Combarieu' }],
        replyTo: { email: email, name: nom },
        subject: `🚀 Nouveau Contact : ${escapeHtml(entreprise)}`,
        htmlContent: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="color: #0A192F; border-bottom: 2px solid #64FFDA; padding-bottom: 10px;">Nouveau message de contact</h2>
            <p>Un visiteur a rempli le formulaire sur le site <strong>Data Sovereign</strong>.</p>

            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>👤 Nom :</strong> ${escapeHtml(nom)}</p>
              <p><strong>🏢 Entreprise :</strong> ${escapeHtml(entreprise)}</p>
              <p><strong>📧 Email :</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
              <p><strong>☁️ Fournisseur actuel :</strong> ${escapeHtml(fournisseur)}</p>
            </div>

            <p><strong>💬 Message :</strong></p>
            <div style="background: #fff; border-left: 4px solid #FF8C00; padding: 10px 15px; font-style: italic;">
              ${escapeHtml(message) || '<em>Aucun message fourni</em>'}
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 0.8rem; color: #888; text-align: center;">
              Ceci est un email automatique envoyé depuis le formulaire de contact Data Sovereign.
            </p>
          </div>
        `
      })
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ message: 'Email envoyé avec succès' });
    } else {
      console.error('Erreur Brevo détaillée:', JSON.stringify(data));
      // Si l'erreur est "API Key is not enabled", on le remonte clairement
      if (data.code === 'unauthorized') {
        return res.status(401).json({ error: 'La clé API Brevo n\'est pas activée ou est invalide. Veuillez vérifier votre compte Brevo.' });
      }
      return res.status(response.status).json({ error: data.message || 'Échec de l\'envoi via Brevo' });
    }
  } catch (error) {
    console.error('Erreur serveur critique:', error);
    return res.status(500).json({ error: 'Erreur interne lors du traitement du formulaire' });
  }
}
