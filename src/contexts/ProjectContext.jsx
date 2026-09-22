import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { DataService } from '../services/dataService';
import { INITIAL_DEMO_PROJECT } from '../services/mockData';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Core project records for live calculations
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [stages, setStages] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [fundings, setFundings] = useState([]);

  const refreshProjectData = useCallback(async (projectId) => {
    if (!projectId) return;
    try {
      const [expList, budList, stgList, matList, tskList, supList, fndList] = await Promise.all([
        DataService.getExpenses(projectId),
        DataService.getBudgets(projectId),
        DataService.getStages(projectId),
        DataService.getMaterials(projectId),
        DataService.getTasks(projectId),
        DataService.getSuppliers(projectId),
        DataService.getFundings(projectId)
      ]);

      setExpenses(expList || []);
      setBudgets(budList || []);
      setStages(stgList || []);
      setMaterials(matList || []);
      setTasks(tskList || []);
      setSuppliers(supList || []);
      setFundings(fndList || []);
    } catch (e) {
      console.error('Error refreshing project data:', e);
    }
  }, []);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const list = await DataService.getProjects(user?.id);
      const safeList = list && list.length > 0 ? list : [];
      setProjects(safeList);
      
      const storedId = localStorage.getItem('hbt_active_project_id');
      const active = safeList.find(p => p.id === storedId) || safeList[0] || null;
      setCurrentProject(active);
      if (active) {
        localStorage.setItem('hbt_active_project_id', active.id);
        await refreshProjectData(active.id);
      } else {
        setExpenses([]);
        setBudgets([]);
        setStages([]);
        setMaterials([]);
        setTasks([]);
        setSuppliers([]);
        setFundings([]);
      }
    } catch (e) {
      console.error('Error loading projects:', e);
    } finally {
      setLoading(false);
    }
  }, [user?.id, refreshProjectData]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const switchProject = (projectId) => {
    const target = projects.find(p => p.id === projectId);
    if (target) {
      setCurrentProject(target);
      localStorage.setItem('hbt_active_project_id', target.id);
      refreshProjectData(target.id);
    }
  };

  const createProject = async (projectData) => {
    const created = await DataService.createProject(projectData, user?.id);
    await loadProjects();
    if (created) {
      switchProject(created.id);
    }
    return created;
  };

  const updateCurrentProject = async (updates) => {
    if (!currentProject) return;
    const updated = await DataService.updateProject(currentProject.id, updates);
    setCurrentProject(updated);
    setProjects(prev => prev.map(p => p.id === currentProject.id ? updated : p));
    return updated;
  };

  const deleteCurrentProject = async (id) => {
    await DataService.deleteProject(id);
    await loadProjects();
  };

  // Computations
  const summary = useMemo(() => {
    const totalBudget = Number(currentProject?.total_budget) || 0;
    
    const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
    const totalPaid = expenses.reduce((sum, exp) => {
      if (exp.payment_status === 'Paid') return sum + Number(exp.amount || 0);
      if (exp.payment_status === 'Partially Paid') return sum + Number(exp.paid_amount || 0);
      return sum;
    }, 0);

    const pendingPayments = totalSpent - totalPaid;
    const remainingBudget = totalBudget - totalSpent;
    const budgetUsedPct = totalBudget > 0 ? Number(((totalSpent / totalBudget) * 100).toFixed(1)) : 0;

    const materialCost = expenses
      .filter(e => e.category_id?.includes('mat') || e.category_id?.includes('cement') || e.category_id?.includes('steel') || e.category_id?.includes('sand') || e.category_id?.includes('brick') || e.category_id?.includes('tile') || e.category_id?.includes('paint') || e.category_id?.includes('wood'))
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const labourCost = expenses
      .filter(e => e.category_id?.includes('labour') || e.category_id?.includes('mason') || e.category_id?.includes('helper') || e.category_id?.includes('carpenter') || e.category_id?.includes('electrician') || e.category_id?.includes('plumber'))
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const contractorCost = expenses
      .filter(e => e.category_id?.includes('contractor'))
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const otherCost = Math.max(0, totalSpent - (materialCost + labourCost + contractorCost));

    const totalFunding = fundings.reduce((sum, f) => sum + Number(f.amount || 0), 0);
    const availableFunds = totalFunding - totalPaid;

    const lowStockMaterialsCount = materials.filter(m => Number(m.current_stock) <= Number(m.minimum_stock)).length;
    const overdueTasksCount = tasks.filter(t => t.status !== 'Completed' && t.due_date && new Date(t.due_date) < new Date()).length;

    const completedStagesCount = stages.filter(s => s.status === 'Completed').length;
    const totalStagesCount = stages.length || 21;
    const overallProgressPct = stages.length > 0
      ? Math.round(stages.reduce((sum, s) => sum + (Number(s.progress_percentage) || 0), 0) / stages.length)
      : 0;

    const currentActiveStage = stages.find(s => s.status === 'In Progress') || stages.find(s => s.status === 'Not Started') || stages[0];

    return {
      totalBudget,
      totalSpent,
      totalPaid,
      remainingBudget,
      budgetUsedPct,
      pendingPayments,
      materialCost,
      labourCost,
      contractorCost,
      otherCost,
      totalFunding,
      availableFunds,
      lowStockMaterialsCount,
      overdueTasksCount,
      completedStagesCount,
      totalStagesCount,
      overallProgressPct,
      currentActiveStage
    };
  }, [currentProject, expenses, materials, tasks, stages, fundings]);

  return (
    <ProjectContext.Provider value={{
      projects,
      currentProject,
      loading,
      expenses,
      budgets,
      stages,
      materials,
      tasks,
      suppliers,
      fundings,
      summary,
      switchProject,
      createProject,
      updateCurrentProject,
      deleteCurrentProject,
      refreshProjectData: () => currentProject && refreshProjectData(currentProject.id),
      loadProjects
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
