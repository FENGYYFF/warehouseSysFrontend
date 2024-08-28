import Vue from 'vue';
import Vuex from 'vuex';
import router, { resetRouter } from "../router";

Vue.use(Vuex);

function addNewRoute(menuList) {
    const indexRoute = router.options.routes.find(route => route.path === "/Index");

    if (indexRoute) {
        menuList.forEach(menu => {
            const childRoute = {
                path: '/' + menu.menuclick,
                name: menu.menuname,
                meta: { title: menu.menuname },
                component: () => import('../components/' + menu.menucomponent)
            };

            indexRoute.children.push(childRoute);
        });

        resetRouter();
        router.addRoutes([indexRoute]);
    }
}

export default new Vuex.Store({
    state: {
        menu: []
    },
    mutations: {
        setMenu(state, menuList) {
            state.menu = menuList;
            addNewRoute(menuList);
        }
    },
    getters: {
        getMenu: state => state.menu
    }
});
