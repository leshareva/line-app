const base = {
    users: [{
        user_id: 'user_id1',
        level: 1,
        experience: 4800,
        steps: {
            step_id1: true,
            step_id2: false
        },
        models: {
            model_id1: true
        },
        skills: [
            {
                skill_id: 'skill_id1',
                skill_name: 'Визуальная коммуникация',
                points: 5
            },
            {
                skill_id: 'skill_id2',
                skill_name: 'Проектирование',
                points: 3
            }
        ],
        selected_model: 'model_id1'
    }],
    user_skill: {
        user_id1: {
            skill_id1: 5,
            skill_id2: 3
        }

    },
    steps: [{
        step_id: 'step_id1',
        title: 'Общая подготовка',
        desc: 'Описание что и как и зачем',
        models: ['model_id1']
    },
    {
        step_id: 'step_id2',
        title: 'Лакмус',
        desc: 'Описание что и как и зачем',
        models: ['model_id2', 'model_id3']
    }],
    models: [{
        model_id: 'model_id1',
        step_id: 'step_id1',
        skills: [
            {
                skill_id: 'skill_id1',
                title: 'Проектирование',
                max_points: 10,
                min_points: 4
            },
            {
                skill_id: 'skill_id2',
                title: 'Визуальная коммуникация',
                max_points: 16,
                min_points: 5
            }
        ],
        tasks: {
            task_id1: {
                task_id: 'task_id1',
                title: 'Название задачи',
                desc: 'Описание',
            }
        }
    }],
    tasks: [{
        task_id: 'task_id1',
        date: 12312312312312,
        video_url: 'https://',
        images: ['url', 'url'],
        title: 'Название задачи',
        desc: 'Описание',
        rubric_id: 'rubric_id1',
        users: {
            user_id1: true
        },
        skills: {
            skill_id1: {
                skill_id: 'skill_id1',
                title: 'Проектирование',
                image_url: 'string',
                points: 5
            },
            skill_id2: {
                skill_id: 'skill_id2',
                title: 'Визуальная коммуникация',
                image_url: 'string',
                points: 3
            }
        },
        models: {
            model_id1: true,
            model_id2: true
        },
        amounts: {
            hot: {
                skill_id1: 1,
                skill_id2: 1,
            }
        },
        criterias: [
            {
                title: 'Типографика',
                skill_id: 'skill_id2'
            },
            
        ]
    }],
    skills: [{
        skill_id: 'skill_id1',
        title: 'Проектирование',
        desc: 'Как дизайнер умеет делать что-то'
    }],
    rubrics: [{
        rubric_id: 'rubric_id1',
        title: 'Спринт',
        desc: '5 дней, 5 макетов, 5 разборов'
    }],
    leveles: [
        {
            level_id: 'level_id1',
        }
    ],
    works: [{
        work_id: 'work_id1',
        task_id: 'task_id1',
        user_id: 'user_id1',
        date: 12312321,
        avg_amount: 2,
        votes: [
            {
                amount: 2,
                voter_id: 'user_id2'
            }
        ]
    }],
    history: [{

    }],
    votes: [
        {
            feedbacker_id: 'user_id2',
            amount: 3,
        }
    ]
}






let result;

//получить ступеней — 1 запрос
let stages = base.steps

//получить пользователя вместе с моделью — 1 запрос
let user = base.users[0]
let model_id = user.selected_model //если есть
let model = base.models.find(el => el.model_id === model_id) //1 запрос

// console.log('навыки модели', model.skills);


//получить задания для портфолио модели - 1 запрос
let model_tasks = base.tasks.filter(el => el.models[model_id])

//получить задачи по рубрике
let rubric = base.rubrics[0]
let res = base.tasks.filter(el => el.rubric_id === rubric.rubric_id)


//получить задачи подходящие к навыкам — 1 запрос
let skill = user.skills[0];
let res1 = base.tasks.filter(el => el.skills[skill.skill_id] && el.skills[skill.skill_id].points >= skill.points);




//получить рубрики в которых есть задания для этой модели


//открывая ступень нам нужно посмотреть есть модели, которые доступны пользователю. Если да, то, рендерим.



//голосования