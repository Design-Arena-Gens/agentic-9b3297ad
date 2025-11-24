import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { question, universeData } = await request.json();

    if (!question || !universeData) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // Analyze the question and provide intelligent answers
    const questionLower = question.toLowerCase();
    let answer = '';

    // Questions about counts
    if (questionLower.includes('combien') || questionLower.includes('nombre')) {
      if (questionLower.includes('class')) {
        answer = `L'univers "${universeData.name}" contient ${universeData.classes} classes: ${universeData.details.classList.join(', ')}.`;
      } else if (questionLower.includes('objet')) {
        answer = `Il y a ${universeData.objects} objets au total dans cet univers (${universeData.dimensions} dimensions et ${universeData.measures} mesures).`;
      } else if (questionLower.includes('dimension')) {
        answer = `L'univers contient ${universeData.dimensions} dimensions.`;
      } else if (questionLower.includes('mesure') || questionLower.includes('indicateur')) {
        answer = `L'univers contient ${universeData.measures} mesures/indicateurs.`;
      } else if (questionLower.includes('table')) {
        answer = `Il y a ${universeData.tables} tables dans cet univers: ${universeData.details.tableList.join(', ')}.`;
      } else if (questionLower.includes('jointure') || questionLower.includes('join')) {
        answer = `L'univers contient ${universeData.joins} jointures.`;
      } else {
        answer = `L'univers "${universeData.name}" contient:\n- ${universeData.classes} classes\n- ${universeData.objects} objets (${universeData.dimensions} dimensions, ${universeData.measures} mesures)\n- ${universeData.tables} tables\n- ${universeData.joins} jointures`;
      }
    }
    // Questions about lists
    else if (questionLower.includes('liste') || questionLower.includes('quels') || questionLower.includes('quelles')) {
      if (questionLower.includes('class')) {
        answer = `Les classes de l'univers sont:\n${universeData.details.classList.map((c: string) => `• ${c}`).join('\n')}`;
      } else if (questionLower.includes('objet')) {
        answer = `Voici les objets de l'univers:\n${universeData.details.objectList.slice(0, 20).map((o: string) => `• ${o}`).join('\n')}${universeData.details.objectList.length > 20 ? `\n... et ${universeData.details.objectList.length - 20} autres objets` : ''}`;
      } else if (questionLower.includes('table')) {
        answer = `Les tables de l'univers sont:\n${universeData.details.tableList.map((t: string) => `• ${t}`).join('\n')}`;
      } else {
        answer = `L'univers contient ces classes:\n${universeData.details.classList.map((c: string) => `• ${c}`).join('\n')}`;
      }
    }
    // Search for specific items
    else if (questionLower.includes('cherche') || questionLower.includes('trouve') || questionLower.includes('existe')) {
      const searchTerm = question.split(/cherche|trouve|existe/i)[1]?.trim().replace(/[?\.]/g, '');
      if (searchTerm) {
        const foundClasses = universeData.details.classList.filter((c: string) =>
          c.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const foundObjects = universeData.details.objectList.filter((o: string) =>
          o.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const foundTables = universeData.details.tableList.filter((t: string) =>
          t.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (foundClasses.length > 0 || foundObjects.length > 0 || foundTables.length > 0) {
          answer = 'J\'ai trouvé:\n';
          if (foundClasses.length > 0) {
            answer += `\n📁 Classes:\n${foundClasses.map((c: string) => `  • ${c}`).join('\n')}`;
          }
          if (foundObjects.length > 0) {
            answer += `\n\n📊 Objets:\n${foundObjects.map((o: string) => `  • ${o}`).join('\n')}`;
          }
          if (foundTables.length > 0) {
            answer += `\n\n📋 Tables:\n${foundTables.map((t: string) => `  • ${t}`).join('\n')}`;
          }
        } else {
          answer = `Je n'ai pas trouvé d'élément contenant "${searchTerm}" dans cet univers.`;
        }
      }
    }
    // General information
    else if (questionLower.includes('structure') || questionLower.includes('organisation')) {
      answer = `L'univers "${universeData.name}" est organisé en ${universeData.classes} classes principales:\n${universeData.details.classList.map((c: string) => `• ${c}`).join('\n')}\n\nIl contient ${universeData.objects} objets métier répartis entre dimensions (${universeData.dimensions}) et mesures (${universeData.measures}), s'appuyant sur ${universeData.tables} tables reliées par ${universeData.joins} jointures.`;
    }
    // Default response
    else {
      answer = `Je peux vous aider avec des questions sur l'univers "${universeData.name}":\n\n• "Combien de classes/objets/tables?"\n• "Liste des classes/objets/tables"\n• "Cherche [terme]"\n• "Quelle est la structure?"\n\nL'univers contient actuellement ${universeData.classes} classes, ${universeData.objects} objets, et ${universeData.tables} tables.`;
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Error processing question:', error);
    return NextResponse.json(
      { error: 'Error processing question' },
      { status: 500 }
    );
  }
}
